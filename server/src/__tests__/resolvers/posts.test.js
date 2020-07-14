const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('../__utils');
const inMemoryDb = require('../fixtures/inMemoryDb');
const {
  createInitData,
  mockUser01Id,
  mockCommunity01Id,
  mockUploadResponse,
} = require('../fixtures/createInitData');

// Mocking dependencies
jest.mock('../../utils/uploadImg');
const uploadImg = require('../../utils/uploadImg');

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

/* POSTS MUTATIONS */
describe('[Mutation.posts]', () => {
  // createPost resolvers
  it('Create post by user', async () => {
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
});
