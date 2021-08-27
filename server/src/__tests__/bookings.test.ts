import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server-koa";
// @ts-ignore
import Redis from "ioredis-mock";
import { constructTestServer } from "./__utils";
import { connect, close, cleanup } from "./__mocks__/inMemoryDb";
import createInitData, {
  mockUser01,
  mockUser03,
  mockPost01,
  mockBooking01,
  mockCommunity01,
  mockNotification02,
} from "./__mocks__/createInitData";
import Notification from "../models/notification";
import pushNotification from "../utils/pushNotification";

jest.mock("../utils/pushNotification");
const mockedPushNotification = pushNotification as jest.Mock<any>;

// Connect to a new in-memory database before running any tests.
beforeAll(async () => {
  await connect();
});

beforeEach(async () => {
  await createInitData();
});

// Clear all test data after every test.
afterEach(async () => {
  await cleanup();
});

// Remove and close the db and server
afterAll(async () => {
  await close();
});

const UPDATE_BOOKING = gql`
  mutation UpdateBooking($bookingInput: BookingInput!) {
    updateBooking(bookingInput: $bookingInput) {
      _id
      status
    }
  }
`;

/* BOOKINGS MUTATIONS */
describe("[Mutation.bookings]", () => {
  // UPDATE_BOOKING MUTATION { status === 1 }
  it("Accept booking", async () => {
    const redis = new Redis();
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() }, redis }),
    });

    mockedPushNotification.mockImplementation(() => {});

    const bookingInput = {
      status: 1,
      bookingId: mockBooking01._id.toString(),
      communityId: mockCommunity01._id.toString(),
      notificationId: mockNotification02._id.toString(),
      notifyContent: `${mockUser01.name} has accepted your booking on ${mockPost01.title}`,
      notifyRecipientId: mockUser03._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: UPDATE_BOOKING,
      variables: { bookingInput },
    });
    const hasNotifications = await redis.hget(
      `notifications:${mockUser03._id.toString()}`,
      `${mockCommunity01._id.toString()}`
    );
    const notification = await Notification.findById(mockNotification02._id);

    expect(res.data.updateBooking).toMatchObject({
      status: 1,
    });
    expect(hasNotifications).toEqual("true");

    expect(notification).toMatchObject({
      isRead: expect.objectContaining({
        [mockUser01._id.toString()]: true,
        [mockUser03._id.toString()]: false,
      }),
    });
  });

  // UPDATE_BOOKING MUTATION { status === 2 }
  it("Deny booking", async () => {
    const redis = new Redis();
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() }, redis }),
    });

    mockedPushNotification.mockImplementation(() => {});

    const bookingInput = {
      status: 2,
      bookingId: mockBooking01._id.toString(),
      communityId: mockCommunity01._id.toString(),
      notificationId: mockNotification02._id.toString(),
      notifyContent: `${mockUser01.name} has denied your booking on ${mockPost01.title}`,
      notifyRecipientId: mockUser03._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: UPDATE_BOOKING,
      variables: { bookingInput },
    });
    const hasNotifications = await redis.hget(
      `notifications:${mockUser03._id.toString()}`,
      `${mockCommunity01._id.toString()}`
    );
    const notification = await Notification.findById(mockNotification02._id);

    expect(res.data.updateBooking).toMatchObject({
      status: 2,
    });
    expect(hasNotifications).toEqual("true");

    expect(notification).toMatchObject({
      isRead: expect.objectContaining({
        [mockUser01._id.toString()]: true,
        [mockUser03._id.toString()]: false,
      }),
    });
  });
});
