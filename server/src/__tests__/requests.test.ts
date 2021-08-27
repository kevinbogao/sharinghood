import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server-koa";
import { constructTestServer } from "./__utils";
import { connect, close, cleanup } from "./__mocks__/inMemoryDb";
import createInitData, {
  mockUser01,
  mockUser03,
  mockThread02,
  mockRequest01,
  mockRequest02,
  mockCommunity01,
  mockUploadResponse,
} from "./__mocks__/createInitData";
import User from "../models/user";
import Thread from "../models/thread";
import Request from "../models/request";
import Community from "../models/community";
import uploadImg from "../utils/uploadImg";
import pushNotification from "../utils/pushNotification";

// Mocking dependencies
jest.mock("../utils/uploadImg");
const mockedUploadImg = uploadImg as jest.Mock<any>;

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

/* REQUESTS QUERIES */
describe("[Query.requests]", () => {
  // REQUEST QUERY { requestId }
  it("Get request by id", async () => {
    const GET_REQUEST = gql`
      query Request($requestId: ID!) {
        request(requestId: $requestId) {
          _id
          title
          desc
          image
          dateNeed
          dateReturn
          creator {
            _id
            name
            image
            apartment
            createdAt
          }
          threads {
            _id
            content
            poster {
              _id
            }
            community {
              _id
            }
          }
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_REQUEST,
      variables: { requestId: mockRequest01._id.toString() },
    });

    expect(res.data.request).toMatchObject({
      _id: mockRequest01._id.toString(),
      title: mockRequest01.title,
      desc: mockRequest01.desc,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01._id.toString(),
        name: mockUser01.name,
        image: mockUser01.image,
        apartment: mockUser01.apartment,
      },
    });

    expect(res.data.request.threads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockThread02._id.toString(),
          content: mockThread02.content,
          poster: {
            _id: mockUser03._id.toString(),
          },
        }),
      ])
    );
  });

  // REQUESTS QUERY { communityId }
  it("Get requests from community", async () => {
    const GET_REQUESTS = gql`
      query Requests($communityId: ID!) {
        requests(communityId: $communityId) {
          _id
          title
          desc
          image
          dateNeed
          creator {
            _id
            name
          }
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_REQUESTS,
      variables: { communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.requests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockRequest01._id.toString(),
          title: mockRequest01.title,
          desc: mockRequest01.desc,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01._id.toString(),
            name: mockUser01.name,
          },
        }),
        expect.objectContaining({
          _id: mockRequest02._id.toString(),
          title: mockRequest02.title,
          desc: mockRequest02.desc,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser03._id.toString(),
            name: mockUser03.name,
          },
        }),
      ])
    );
  });
});

/* REQUESTS MUTATIONS */
describe("[Mutation.requests]", () => {
  it("Create request to community", async () => {
    const CREATE_REQUEST = gql`
      mutation CreateRequest($requestInput: RequestInput!, $communityId: ID!) {
        createRequest(requestInput: $requestInput, communityId: $communityId) {
          _id
          title
          desc
          image
          dateType
          dateNeed
          dateReturn
          creator {
            _id
            name
          }
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({
        user: {
          userId: mockUser01._id.toString(),
          userName: mockUser01.name,
        },
      }),
    });

    mockedUploadImg.mockImplementation(() =>
      JSON.stringify(mockUploadResponse)
    );
    mockedPushNotification.mockImplementation(() => {});

    const requestInput = {
      title: "Test Request 01",
      desc: "testRequest01",
      image: mockedUploadImg(),
      dateType: 2,
      dateNeed: `${new Date()}`,
      dateReturn: `${new Date()}`,
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_REQUEST,
      variables: { requestInput, communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.createRequest).toMatchObject({
      title: requestInput.title,
      desc: requestInput.desc,
      image: JSON.stringify(mockUploadResponse),
      dateType: requestInput.dateType,
      dateNeed: `${new Date(requestInput.dateNeed).getTime()}`,
      dateReturn: `${new Date(requestInput.dateReturn).getTime()}`,
      creator: {
        _id: mockUser01._id.toString(),
        name: mockUser01.name,
      },
    });
  });

  // DELETE_REQUEST MUTATION { requestId }
  it("Delete user's request", async () => {
    const DELETE_REQUEST = gql`
      mutation DeleteRequest($requestId: ID!) {
        deleteRequest(requestId: $requestId) {
          _id
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: DELETE_REQUEST,
      variables: { requestId: mockRequest01._id.toString() },
    });

    // Expect mockRequest01's id to be returned
    expect(res.data.deleteRequest).toMatchObject({
      _id: mockRequest01._id.toString(),
    });

    const [user, request, threads, communities] = await Promise.all([
      User.findById(mockUser01._id),
      Request.findById(mockRequest01._id),
      Thread.find({ _id: { $in: mockRequest01.threads } }),
      Community.find({ _id: { $in: mockUser01.communities } }),
    ]);

    expect(request).toBeNull();
    expect(user).not.toBeNull();
    if (user) {
      expect(user.requests).not.toEqual(
        expect.arrayContaining([mockRequest01._id])
      );
    }
    expect(threads).toHaveLength(0);
    communities.map((community) =>
      expect(community.requests).not.toEqual(
        expect.arrayContaining([mockRequest01._id])
      )
    );
  });

  // DELETE_REQUEST MUTATION { requestId }
  it("Delete request by unauthorized user", async () => {
    const DELETE_REQUEST = gql`
      mutation DeleteRequest($requestId: ID!) {
        deleteRequest(requestId: $requestId) {
          _id
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser03._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: DELETE_REQUEST,
      variables: { requestId: mockRequest01._id.toString() },
    });

    expect(res.errors).toBeDefined();
    if (res.errors) {
      expect(res.errors[0].message).toEqual(
        "ForbiddenError: Unauthorized user"
      );
    }
  });
});
