const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('../__utils');
const inMemoryDb = require('../__fixtures__/inMemoryDb');
const {
  createInitData,
  mockUser01,
  mockUser01Id,
  mockPost01,
  mockPost01Id,
  mockPost02,
  mockPost02Id,
  mockCommunity01Id,
  mockCommunity02Id,
  mockUploadResponse,
} = require('../__fixtures__/createInitData');
const Post = require('../../models/post');
const User = require('../../models/user');
const Thread = require('../../models/thread');
const Booking = require('../../models/booking');
const Community = require('../../models/community');
const Notification = require('../../models/notification');

// Mocking dependencies
jest.mock('../../utils/uploadImg');
const uploadImg = require('../../utils/uploadImg');

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

/* POSTS QUERY */
describe('[Query.posts]', () => {
  // POST QUERY { postId }
  it('Get post { postId }', async () => {
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
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_POST,
      variables: { postId: mockPost01Id.toString() },
    });

    expect(res.data.post).toMatchObject({
      _id: mockPost01Id.toString(),
      title: mockPost01.title,
      desc: mockPost01.desc,
      condition: mockPost01.condition,
      isGiveaway: mockPost01.isGiveaway,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01Id.toString(),
        name: mockUser01.name,
        image: mockUser01.image,
        apartment: mockUser01.apartment,
      },
    });
  });

  // POSTS QUERY { communityId }
  it('Get posts { communityId }', async () => {
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
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_POSTS,
      variables: { communityId: mockCommunity01Id.toString() },
    });

    expect(res.data.posts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: mockPost01Id.toString(),
          title: mockPost01.title,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01Id.toString(),
            name: mockUser01.name,
          },
        }),
        expect.objectContaining({
          _id: mockPost02Id.toString(),
          title: mockPost02.title,
          image: JSON.stringify(mockUploadResponse),
          creator: {
            _id: mockUser01Id.toString(),
            name: mockUser01.name,
          },
        }),
      ])
    );
  });
});

/* POSTS MUTATIONS */
describe('[Mutation.posts]', () => {
  // CREATE_POST MUTATION { communityId }
  it('Create post by user { communityId }', async () => {
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

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id.toString() } }),
    });

    // Mock uploadImg function
    uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));

    // Mock pushNotification function
    pushNotification.mockImplementation(() => {});

    // Create community mutation input
    const postInput = {
      title: 'Test Post 01',
      desc: 'testPost01',
      image: uploadImg(),
      condition: 0,
      isGiveaway: true,
    };

    // Create test instance
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_POST,
      variables: { postInput, communityId: mockCommunity01Id.toString() },
    });

    expect(res.data.createPost).toMatchObject({
      title: postInput.title,
      desc: postInput.desc,
      condition: postInput.condition,
      isGiveaway: postInput.isGiveaway,
      image: JSON.stringify(mockUploadResponse),
      creator: {
        _id: mockUser01Id.toString(),
      },
    });
  });

  // INACTIVATE_POST MUTATION { postId }
  it("Inactivate user's post in all communities", async () => {
    const INACTIVATE_POST = gql`
      mutation InactivatePost($postId: ID!) {
        inactivatePost(postId: $postId)
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: INACTIVATE_POST,
      variables: { postId: mockPost01Id.toString() },
    });

    expect(res.data.inactivatePost).toBeTruthy();

    // Check if post is removed from community01, community02 on sucess
    if (res.data.inactivatePost) {
      const communities = await Community.find({
        _id: {
          $in: [mockCommunity01Id.toString(), mockCommunity02Id.toString()],
        },
      });

      communities.map((community) =>
        expect(community.posts).not.toEqual(
          expect.arrayContaining([mockPost01Id])
        )
      );
    }
  });

  // DELETE_POST MUTATION { postId }
  it("Delete user's posy", async () => {
    const DELETE_POST = gql`
      mutation DeletePost($postId: ID!) {
        deletePost(postId: $postId) {
          _id
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: DELETE_POST,
      variables: { postId: mockPost01Id.toString() },
    });

    // Expect mockPost01's id to be returned
    expect(res.data.deletePost).toMatchObject({
      _id: mockPost01Id.toString(),
    });

    const [
      post,
      user,
      communities,
      threads,
      bookings,
      notifications,
    ] = await Promise.all([
      Post.findById(mockPost01Id),
      User.findById(mockPost01.creator),
      Community.find({
        _id: {
          $in: [mockCommunity01Id.toString(), mockCommunity02Id.toString()],
        },
      }),
      Thread.find({ _id: { $in: mockPost01.threads } }),
      Booking.find({ _id: { $in: mockPost01.bookings } }),
      Notification.find({
        $or: [
          { booking: { $in: mockPost01.bookings } },
          { post: mockPost01Id },
        ],
      }),
    ]);

    // Expect post to be null
    expect(post).toBeNull();

    // Expect post id not to be contained in communities' posts
    expect(user.posts).not.toEqual(expect.arrayContaining([mockPost01Id]));

    // Expect post id not to be contained in communities' posts
    communities.map((community) =>
      expect(community.posts).not.toEqual(
        expect.arrayContaining([mockPost01Id])
      )
    );

    // Expect threads, bookings & notifications to be empty arrays
    expect(threads).toHaveLength(0);
    expect(bookings).toHaveLength(0);
    expect(notifications).toHaveLength(0);
  });

  // ADD_POST_TO_COMMUNITY Mutation
  it("Add user's post to community", async () => {
    const ADD_POST_TO_COMMUNITY = gql`
      mutation AddPostToCommunity($postId: ID!, $communityId: ID!) {
        addPostToCommunity(postId: $postId, communityId: $communityId) {
          _id
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    const { query } = createTestClient(server);
    const res = await query({
      query: ADD_POST_TO_COMMUNITY,
      variables: {
        postId: mockPost02Id.toString(),
        communityId: mockCommunity02Id.toString(),
      },
    });

    // Expect mockCommunity02's id to be returned
    expect(res.data.addPostToCommunity).toMatchObject({
      _id: mockCommunity02Id.toString(),
    });

    const community02 = await Community.findById(mockCommunity02Id);

    // Expect mockCommunity02's posts array to include mockPost02Id
    expect(community02.posts).toEqual(expect.arrayContaining([mockPost02Id]));
  });
});
