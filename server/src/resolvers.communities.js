const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('../__utils');
const {
  connectToTestDB,
  dropTestDB,
  closeTestDBConnection,
  mockUser01Id,
} = require('../database/setup');

beforeAll(async () => {
  await connectToTestDB();
});

afterAll(async () => {
  await dropTestDB();
  await closeTestDBConnection();
});

describe('[Mutation.communities]', () => {
  it('Create community with registered user', async () => {
    // Create community mutation
    const CREATE_COMMUNITY = gql`
      mutation CreateCommunity($communityInput: CommunityInput!) {
        createCommunity(communityInput: $communityInput) {
          _id
          name
          code
          zipCode
          creator {
            _id
          }
        }
      }
    `;

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    // Create community mutation input
    const createCommunityInput = {
      name: 'TestCommunity02',
      code: 'testCommunity02',
      zipCode: '10002',
    };

    // Create test instance
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_COMMUNITY,
      variables: {
        communityInput: {
          name: createCommunityInput.name,
          code: createCommunityInput.code,
          zipCode: createCommunityInput.zipCode,
        },
      },
    });

    // Check create community response against mutation input
    expect(res.data.createCommunity).toMatchObject({
      name: createCommunityInput.name,
      code: createCommunityInput.code,
      zipCode: createCommunityInput.zipCode,
      creator: {
        _id: mockUser01Id.toString(),
      },
    });
  });
});
