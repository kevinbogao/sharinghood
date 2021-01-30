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
  mockPost02,
  mockCommunity01,
  mockCommunity02,
  mockUploadResponse,
  updatedMockUploadResponse,
} = require("./__mocks__/createInitData");
const Post = require("../models/post");
const User = require("../models/user");
const Thread = require("../models/thread");
const Booking = require("../models/booking");
const Community = require("../models/community");
const Notification = require("../models/notification");

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

const CREATE_POST = gql`
  mutation CreatePost($postInput: PostInput!, $communityId: ID) {
    createPost(postInput: $postInput, communityId: $communityId) {
      _id
      title
      desc
      image
      condition
      isGiveaway
      creator {
        _id
        name
      }
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($postInput: PostInput!) {
    updatePost(postInput: $postInput) {
      _id
      title
      desc
      image
      condition
    }
  }
`;

const INACTIVATE_POST = gql`
  mutation InactivatePost($postId: ID!) {
    inactivatePost(postId: $postId)
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId) {
      _id
    }
  }
`;

const ADD_POST_TO_COMMUNITY = gql`
  mutation AddPostToCommunity($postId: ID!, $communityId: ID!) {
    addPostToCommunity(postId: $postId, communityId: $communityId) {
      _id
    }
  }
`;

/* POSTS QUERY */
describe("[Query.posts]", () => {
  // POST QUERY { postId }
  it("Get post by id", async () => {
    const GET_POST = gql`
      query Post($postId: ID!) {
        post(postId: $postId) {
          _id
          title
          desc
          image
          condition
          isGiveaway
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
      query: GET_POST,
      variables: { postId: mockPost01._id.toString() },
    });

    expect(res.data.post).toMatchObject({
      _id: mockPost01._id.toString(),
      title: mockPost01.title,
      desc: mockPost01.desc,
      condition: mockPost01.condition,
      isGiveaway: mockPost01.isGiveaway,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01._id.toString(),
        name: mockUser01.name,
        image: mockUser01.image,
        apartment: mockUser01.apartment,
      },
    });
  });

  // POSTS QUERY { communityId }
  it("Get posts from community", async () => {
    const GET_POSTS = gql`
      query Posts($communityId: ID!) {
        posts(communityId: $communityId) {
          _id
          title
          image
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
      query: GET_POSTS,
      variables: { communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.posts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockPost01._id.toString(),
          title: mockPost01.title,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01._id.toString(),
            name: mockUser01.name,
          },
        }),
        expect.objectContaining({
          _id: mockPost02._id.toString(),
          title: mockPost02.title,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01._id.toString(),
            name: mockUser01.name,
          },
        }),
      ])
    );
  });
});

/* POSTS MUTATIONS */
describe("[Mutation.posts]", () => {
  // CREATE_POST MUTATION { communityId }
  it("Create post by user { communityId }", async () => {
    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() } }),
    });

    // Mock uploadImg function
    uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));

    // Mock pushNotification function
    pushNotification.mockImplementation(() => {});

    // Create community mutation input
    const postInput = {
      title: "Test Post 01",
      desc: "testPost01",
      image: uploadImg(),
      condition: 0,
      isGiveaway: true,
    };

    // Create test instance
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_POST,
      variables: { postInput, communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.createPost).toMatchObject({
      title: postInput.title,
      desc: postInput.desc,
      condition: postInput.condition,
      isGiveaway: postInput.isGiveaway,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01._id.toString(),
      },
    });
  });

  // CREATE_POST MUTATION
  it("Create post by user for request { communityId }", async () => {
    const redis = new Redis();

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id.toString() }, redis }),
    });

    uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));
    pushNotification.mockImplementation(() => {});

    const postInput = {
      title: "Test Post 02",
      desc: "testPost02",
      image: uploadImg(),
      condition: 1,
      isGiveaway: false,
      requesterId: mockUser03._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_POST,
      variables: { postInput, communityId: mockCommunity01._id.toString() },
    });
    const notification = await Notification.findOne({
      ofType: 2,
      participants: [mockUser03._id.toString(), mockUser01._id.toString()],
      community: mockCommunity01._id.toString(),
    });

    expect(res.data.createPost).toMatchObject({
      title: postInput.title,
      desc: postInput.desc,
      condition: postInput.condition,
      isGiveaway: postInput.isGiveaway,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01._id.toString(),
      },
    });

    expect(notification).toMatchObject({
      ofType: 2,
      isRead: expect.objectContaining({
        [mockUser01._id.toString()]: false,
        [mockUser03._id.toString()]: false,
      }),
      community: mockCommunity01._id,
    });
  });

  // UPDATE_POST MUTATION
  it("Update post by creator", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    uploadImg.mockImplementation(() =>
      JSON.stringify(updatedMockUploadResponse)
    );

    const postInput = {
      postId: mockPost01._id.toString(),
      title: "Mock Post 01+",
      desc: "mockPost01+",
      image: uploadImg(),
      condition: 1,
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: UPDATE_POST,
      variables: { postInput },
    });

    expect(res.data.updatePost).toMatchObject({
      title: postInput.title,
      desc: postInput.desc,
      image: JSON.stringify(updatedMockUploadResponse),
      condition: postInput.condition,
    });
  });

  // UPDATE_POST MUTATION
  it("Update post by unauthorized user", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser02._id } }),
    });

    uploadImg.mockImplementation(() =>
      JSON.stringify(updatedMockUploadResponse)
    );

    const postInput = {
      postId: mockPost01._id.toString(),
      title: "Mock Post 01+",
      desc: "mockPost01+",
      image: uploadImg(),
      condition: 1,
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: UPDATE_POST,
      variables: { postInput },
    });

    expect(res.errors[0].message).toEqual("ForbiddenError: Unauthorized user");
  });

  // INACTIVATE_POST MUTATION { postId }
  it("Inactivate user's post in all communities", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      query: INACTIVATE_POST,
      variables: { postId: mockPost01._id.toString() },
    });

    expect(res.data.inactivatePost).toBeTruthy();

    // Check if post is removed from community01, community02 on sucess
    if (res.data.inactivatePost) {
      const communities = await Community.find({
        _id: {
          $in: [mockCommunity01._id.toString(), mockCommunity02._id.toString()],
        },
      });

      communities.map((community) =>
        expect(community.posts).not.toEqual(
          expect.arrayContaining([mockPost01._id])
        )
      );
    }
  });

  // INACTIVATE_POST MUTATION { postId }
  it("Inactivate user's by unauthorized user", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser02._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      query: INACTIVATE_POST,
      variables: { postId: mockPost01._id.toString() },
    });

    expect(res.errors[0].message).toEqual("ForbiddenError: Unauthorized user");
  });

  // DELETE_POST MUTATION { postId }
  // TODO: check for messages
  it("Delete user's post", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      query: DELETE_POST,
      variables: { postId: mockPost01._id.toString() },
    });

    // Expect mockPost01's id to be returned
    expect(res.data.deletePost).toMatchObject({
      _id: mockPost01._id.toString(),
    });

    const [
      post,
      user,
      communities,
      threads,
      bookings,
      notifications,
    ] = await Promise.all([
      Post.findById(mockPost01._id),
      User.findById(mockPost01.creator),
      Community.find({
        _id: {
          $in: [mockCommunity01._id.toString(), mockCommunity02._id.toString()],
        },
      }),
      Thread.find({ _id: { $in: mockPost01.threads } }),
      Booking.find({ _id: { $in: mockPost01.bookings } }),
      Notification.find({
        $or: [
          { booking: { $in: mockPost01.bookings } },
          { post: mockPost01._id },
        ],
      }),
    ]);

    // Expect post to be null
    expect(post).toBeNull();

    // Expect post id not to be contained in user's posts
    expect(user.posts).not.toEqual(expect.arrayContaining([mockPost01._id]));

    // Expect post id not to be contained in user's communities' posts
    communities.map((community) =>
      expect(community.posts).not.toEqual(
        expect.arrayContaining([mockPost01._id])
      )
    );

    // Expect threads, bookings & notifications to be empty arrays
    expect(threads).toHaveLength(0);
    expect(bookings).toHaveLength(0);
    expect(notifications).toHaveLength(0);
  });

  // DELETE_POST MUTATION { postId }
  it("Delete user's post by unauthorized user", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser02._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      query: DELETE_POST,
      variables: { postId: mockPost01._id.toString() },
    });

    expect(res.errors[0].message).toEqual("ForbiddenError: Unauthorized user");
  });

  // ADD_POST_TO_COMMUNITY Mutation
  it("Add user's post to community", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      query: ADD_POST_TO_COMMUNITY,
      variables: {
        postId: mockPost02._id.toString(),
        communityId: mockCommunity02._id.toString(),
      },
    });

    // Expect mockCommunity02's id to be returned
    expect(res.data.addPostToCommunity).toMatchObject({
      _id: mockCommunity02._id.toString(),
    });

    const community02 = await Community.findById(mockCommunity02._id);

    // Expect mockCommunity02's posts array to include mockPost02Id
    expect(community02.posts).toEqual(expect.arrayContaining([mockPost02._id]));
  });

  // ADD_POST_TO_COMMUNITY Mutation
  it("Add user's post to community by unauthorized user", async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser02._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      query: ADD_POST_TO_COMMUNITY,
      variables: {
        postId: mockPost02._id.toString(),
        communityId: mockCommunity02._id.toString(),
      },
    });

    expect(res.errors[0].message).toEqual("ForbiddenError: Unauthorized user");
  });
});
