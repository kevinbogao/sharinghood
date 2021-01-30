const { createTestClient } = require("apollo-server-testing");
const { gql } = require("apollo-server");
const Redis = require("ioredis-mock");
const { constructTestServer } = require("./__utils");
const inMemoryDb = require("./__mocks__/inMemoryDb");
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
} = require("./__mocks__/createInitData");

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

const FIND_NOTIFICATION = gql`
  query FindNotification($recipientId: ID!, $communityId: ID!) {
    findNotification(recipientId: $recipientId, communityId: $communityId) {
      _id
    }
  }
`;

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($notificationInput: NotificationInput) {
    createNotification(notificationInput: $notificationInput) {
      _id
      ofType
      booking {
        _id
        status
        dateType
        dateNeed
        dateReturn
        post {
          _id
          title
          image
        }
        booker {
          _id
        }
      }
      participants {
        _id
        name
        image
      }
      isRead
      messages {
        _id
        text
      }
    }
  }
`;

/* NOTIFICATIONS QUERIES */
describe("[Query.notifications]", () => {
  // NOTIFICATIONS QUERY { notificationId }
  it("Get notification by id", async () => {
    const GET_NOTIFICATION = gql`
      query GetNotification($notificationId: ID!) {
        notification(notificationId: $notificationId) {
          _id
          ofType
          booking {
            _id
            status
            dateType
            dateNeed
            dateReturn
            post {
              _id
              title
              image
            }
            booker {
              _id
            }
          }
          post {
            _id
          }
          participants {
            _id
            name
            image
          }
          messages {
            _id
            text
            sender {
              _id
            }
            createdAt
          }
          isRead
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_NOTIFICATION,
      variables: { notificationId: mockNotification02._id.toString() },
    });

    expect(res.data.notification).toMatchObject({
      _id: mockNotification02._id.toString(),
      ofType: 1,
      booking: expect.objectContaining({
        _id: mockBooking01._id.toString(),
        status: 0,
        dateType: 0,
        dateNeed: null,
        dateReturn: null,
        post: expect.objectContaining({
          _id: mockPost01._id.toString(),
          title: mockPost01.title,
          image: JSON.stringify(mockUploadResponse),
        }),
        booker: expect.objectContaining({
          _id: mockUser03._id.toString(),
        }),
      }),
      post: null,
      participants: expect.arrayContaining([
        expect.objectContaining({
          _id: mockUser03._id.toString(),
          name: mockUser03.name,
          image: JSON.stringify(mockUploadResponse),
        }),
      ]),
      messages: expect.arrayContaining([
        expect.objectContaining({
          _id: mockMessage02._id.toString(),
          text: mockMessage02.text,
          sender: {
            _id: mockUser01._id.toString(),
          },
        }),
      ]),
      isRead: expect.objectContaining({
        [mockUser01._id.toString()]: true,
        [mockUser03._id.toString()]: true,
      }),
    });
  });

  // NOTIFICATIONS QUERY { communityId }
  it("Get user's notifications from a community", async () => {
    const GET_NOTIFICATIONS = gql`
      query GetNotifications($communityId: ID!) {
        notifications(communityId: $communityId) {
          _id
          ofType
          booking {
            _id
            status
            dateType
            dateNeed
            dateReturn
            post {
              _id
              title
              image
            }
            booker {
              _id
            }
          }
          post {
            _id
            creator {
              _id
              name
            }
          }
          participants {
            _id
            name
            image
          }
          isRead
          community {
            _id
          }
          messages {
            _id
            text
          }
        }
      }
    `;

    const redis = new Redis({
      data: {
        [`notifications:${mockUser01._id.toString()}`]: {
          [mockCommunity01._id.toString()]: "true",
        },
      },
    });

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() }, redis }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_NOTIFICATIONS,
      variables: { communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockNotification01._id.toString(),
          ofType: 0,
          booking: null,
          post: null,
          participants: expect.arrayContaining([
            expect.objectContaining({
              _id: mockUser03._id.toString(),
              name: mockUser03.name,
              image: JSON.stringify(mockUploadResponse),
            }),
          ]),
          isRead: expect.objectContaining({
            [mockUser01._id.toString()]: false,
            [mockUser03._id.toString()]: false,
          }),
          community: expect.objectContaining({
            _id: mockCommunity01._id.toString(),
          }),
          messages: expect.arrayContaining([
            expect.objectContaining({
              _id: mockMessage01._id.toString(),
              text: mockMessage01.text,
            }),
          ]),
        }),
        expect.objectContaining({
          _id: mockNotification02._id.toString(),
          ofType: 1,
          booking: expect.objectContaining({
            _id: mockBooking01._id.toString(),
            status: 0,
            dateType: 0,
            dateNeed: null,
            dateReturn: null,
            post: expect.objectContaining({
              _id: mockPost01._id.toString(),
              title: mockPost01.title,
              image: JSON.stringify(mockUploadResponse),
            }),
            booker: expect.objectContaining({
              _id: mockUser03._id.toString(),
            }),
          }),
          post: null,
          participants: expect.arrayContaining([
            expect.objectContaining({
              _id: mockUser03._id.toString(),
              name: mockUser03.name,
              image: JSON.stringify(mockUploadResponse),
            }),
          ]),
          isRead: expect.objectContaining({
            [mockUser01._id.toString()]: true,
            [mockUser03._id.toString()]: true,
          }),
          community: expect.objectContaining({
            _id: mockCommunity01._id.toString(),
          }),
          messages: expect.arrayContaining([
            expect.objectContaining({
              _id: mockMessage02._id.toString(),
              text: mockMessage02.text,
            }),
          ]),
        }),
        expect.objectContaining({
          _id: mockNotification03._id.toString(),
          ofType: 2,
          booking: null,
          post: expect.objectContaining({
            _id: mockPost03._id.toString(),
            creator: expect.objectContaining({
              _id: mockUser01._id.toString(),
              name: mockUser01.name,
            }),
          }),
          participants: expect.arrayContaining([
            expect.objectContaining({
              _id: mockUser03._id.toString(),
              name: mockUser03.name,
              image: JSON.stringify(mockUploadResponse),
            }),
          ]),
          isRead: expect.objectContaining({
            [mockUser01._id.toString()]: false,
            [mockUser03._id.toString()]: false,
          }),
          community: expect.objectContaining({
            _id: mockCommunity01._id.toString(),
          }),
          messages: expect.arrayContaining([
            expect.objectContaining({
              _id: mockMessage03._id.toString(),
              text: mockMessage03.text,
            }),
          ]),
        }),
      ])
    );
  });

  // FIND_NOTIFICATION { recipientId, communityId },
  it("Find existing chat notification", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: FIND_NOTIFICATION,
      variables: {
        recipientId: mockUser03._id.toString(),
        communityId: mockCommunity01._id.toString(),
      },
    });

    expect(res.data.findNotification).toMatchObject({
      _id: mockNotification01._id.toString(),
    });
  });

  // FIND_NOTIFICATION { recipientId, communityId },
  it("Find existing chat notification with wrong communityId", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: FIND_NOTIFICATION,
      variables: {
        recipientId: mockUser03._id.toString(),
        communityId: mockCommunity02._id.toString(),
      },
    });

    expect(res.data.findNotification).toBeNull();
  });

  // FIND_NOTIFICATION { recipientId, communityId },
  it("Find existing chat notification with wrong recipientId", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: FIND_NOTIFICATION,
      variables: {
        recipientId: mockUser02._id.toString(),
        communityId: mockCommunity01._id.toString(),
      },
    });

    expect(res.data.findNotification).toBeNull();
  });
});

/* NOTIFICATIONS MUTATIONS */
describe("[Mutation.notifications]", () => {
  // CREATE_NOTIFICATION MUTATION { ofType === 0 }
  it("Create chat notification", async () => {
    const redis = new Redis();

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser02._id.toString() }, redis }),
    });

    pushNotification.mockImplementation(() => {});

    const notificationInput = {
      ofType: 0,
      recipientId: mockUser03._id.toString(),
      communityId: mockCommunity02._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_NOTIFICATION,
      variables: { notificationInput },
    });
    const hasNotifications = await redis.hget(
      `notifications:${mockUser03._id.toString()}`,
      `${mockCommunity02._id.toString()}`
    );

    expect(res.data.createNotification).toMatchObject({
      ofType: 0,
      participants: expect.arrayContaining([
        expect.objectContaining({
          _id: mockUser02._id.toString(),
          name: mockUser02.name,
          image: JSON.stringify(mockUploadResponse),
        }),
        expect.objectContaining({
          _id: mockUser03._id.toString(),
          name: mockUser03.name,
          image: JSON.stringify(mockUploadResponse),
        }),
      ]),
      isRead: expect.objectContaining({
        [mockUser03._id.toString()]: false,
        [mockUser02._id.toString()]: false,
      }),
    });
    expect(res.data.createNotification.messages).toHaveLength(0);
    expect(hasNotifications).toEqual("true");
  });

  // CREATE_NOTIFICATION MUTATION { ofType === 1 }
  it("Create booking notification", async () => {
    const redis = new Redis();

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser03._id.toString() }, redis }),
    });

    pushNotification.mockImplementation(() => {});

    const notificationInput = {
      bookingInput: {
        postId: mockPost03._id.toString(),
        dateType: 0,
        status: 0,
      },
      ofType: 1,
      recipientId: mockUser01._id.toString(),
      communityId: mockCommunity01._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_NOTIFICATION,
      variables: { notificationInput },
    });
    const hasNotifications = await redis.hget(
      `notifications:${mockUser01._id.toString()}`,
      `${mockCommunity01._id.toString()}`
    );

    expect(res.data.createNotification).toMatchObject({
      ofType: 1,
      booking: expect.objectContaining({
        status: notificationInput.bookingInput.status,
        dateType: notificationInput.bookingInput.dateType,
        dateNeed: null,
        dateReturn: null,
        post: expect.objectContaining({
          _id: mockPost03._id.toString(),
          title: mockPost03.title,
          image: JSON.stringify(mockUploadResponse),
        }),
        booker: expect.objectContaining({
          _id: mockUser03._id.toString(),
        }),
      }),
      participants: expect.arrayContaining([
        expect.objectContaining({
          _id: mockUser01._id.toString(),
          name: mockUser01.name,
          image: JSON.stringify(mockUploadResponse),
        }),
        expect.objectContaining({
          _id: mockUser03._id.toString(),
          name: mockUser03.name,
          image: JSON.stringify(mockUploadResponse),
        }),
      ]),
      isRead: expect.objectContaining({
        [mockUser01._id.toString()]: false,
        [mockUser03._id.toString()]: false,
      }),
    });
    expect(res.data.createNotification.messages).toHaveLength(0);
    expect(hasNotifications).toEqual("true");
  });
});
