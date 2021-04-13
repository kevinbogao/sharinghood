const { createTestClient } = require("apollo-server-testing");
const { gql } = require("apollo-server");
const { constructTestServer } = require("./__utils");
const inMemoryDb = require("./__mocks__/inMemoryDb");
const {
  createInitData,
  mockUser01,
  mockUser03,
  mockThread02,
  mockRequest01,
  mockRequest02,
  mockCommunity01,
  mockUploadResponse,
} = require("./__mocks__/createInitData");
const User = require("../models/user");
const Thread = require("../models/thread");
const Request = require("../models/request");
const Community = require("../models/community");

// Mocking dependencies
jest.mock("../utils/uploadImg");
const uploadImg = require("../utils/uploadImg");

jest.mock("../utils/pushNotification");
const pushNotification = require("../utils/pushNotification");

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

    uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));
    pushNotification.mockImplementation(() => {});

    const requestInput = {
      title: "Test Request 01",
      desc: "testRequest01",
      image: uploadImg(),
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
      query: DELETE_REQUEST,
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
    expect(user.requests).not.toEqual(
      expect.arrayContaining([mockRequest01._id])
    );
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
      query: DELETE_REQUEST,
      variables: { requestId: mockRequest01._id.toString() },
    });

    expect(res.errors[0].message).toEqual("ForbiddenError: Unauthorized user");
  });
});
