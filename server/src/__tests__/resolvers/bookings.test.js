const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const Redis = require('ioredis-mock');
const { constructTestServer } = require('../__utils');
const inMemoryDb = require('../__fixtures__/inMemoryDb');
const {
  createInitData,
  mockUser01,
  mockUser02,
  mockUser03,
  mockPost01,
  mockPost03,
  mockMessage01,
  mockMessage02,
  mockMessage03,
  mockBooking01,
  mockCommunity01,
  mockCommunity02,
  mockNotification01,
  mockNotification02,
  mockNotification03,
  mockUploadResponse,
} = require('../__fixtures__/createInitData');

jest.mock('../../utils/pushNotification');
const pushNotification = require('../../utils/pushNotification');

// Connect to a new in-memory database before running any tests.
beforeAll(async () => {
  await inMemoryDb.connect();
});

beforeEach(async () => {
  await createInitData();
});

// Clear all test data after every test.
afterEach(async () => {
  await inMemoryDb.cleanup();
});

// Remove and close the db and server
afterAll(async () => {
  await inMemoryDb.close();
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
describe('[Mutation.bookings]', () => {
  // UPDATE_BOOKING MUTATION { status === 1 }
  it('Accept booking', async () => {
    const redis = new Redis();
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() }, redis }),
    });

    pushNotification.mockImplementation(() => {});

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
      `${mockCommunity02._id.toString()}`
    );

    expect(res.data.updateBooking).toMatchObject({
      status: 1,
    });

    console.log(res.data.updateBooking);
    console.log(hasNotifications);
  });
});
