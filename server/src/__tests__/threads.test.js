const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('./__utils');
const inMemoryDb = require('./__mocks__/inMemoryDb');
const {
  createInitData,
  mockUser01,
  mockUser03,
  mockPost01,
  mockRequest01,
  mockCommunity01,
} = require('./__mocks__/createInitData');

jest.mock('../utils/pushNotification');
const pushNotification = require('../utils/pushNotification');

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

const CREATE_THREAD = gql`
  mutation CreateThread($threadInput: ThreadInput!) {
    createThread(threadInput: $threadInput) {
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
`;

/* THREADS MUTATIONS */
describe('[Mutation.threads]', () => {
  // CREATE_THREAD MUTATION { postId }
  it('Create thread for post', async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser03._id.toString() } }),
    });

    pushNotification.mockImplementation(() => {});

    const threadInput = {
      content: 'Test comment on post01',
      isPost: true,
      parentId: mockPost01._id.toString(),
      communityId: mockCommunity01._id.toString(),
      recipientId: mockUser01._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_THREAD,
      variables: { threadInput },
    });

    expect(res.data.createThread).toMatchObject({
      content: threadInput.content,
      poster: {
        _id: mockUser03._id.toString(),
      },
      community: {
        _id: mockCommunity01._id.toString(),
      },
    });
  });

  // CREATE_THREAD MUTATION { requestId }
  it('Create thread for request', async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser03._id.toString() } }),
    });

    pushNotification.mockImplementation(() => {});

    const threadInput = {
      content: 'Test comment on request01',
      isPost: false,
      parentId: mockRequest01._id.toString(),
      communityId: mockCommunity01._id.toString(),
      recipientId: mockUser01._id.toString(),
    };

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_THREAD,
      variables: { threadInput },
    });

    expect(res.data.createThread).toMatchObject({
      content: threadInput.content,
      poster: {
        _id: mockUser03._id.toString(),
      },
      community: {
        _id: mockCommunity01._id.toString(),
      },
    });
  });
});
