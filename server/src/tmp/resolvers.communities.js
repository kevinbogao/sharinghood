const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('./__utils');
const {
  connectToTestDB,
  dropTestDB,
  closeTestDBConnection,
  mockUploadResponse,
  updatedMockUploadResponse,
  mockUser01,
  mockUser01Id,
  mockCommunity01,
  mockCommunity01Id,
  mockCommunityCreatorUserInput,
  mockRegisterUserCommunityInput,
  mockExistingCommunityUserInput,
} = require('./database/setup');

beforeAll(async (done) => {
  await connectToTestDB();
  done();
});

afterAll(async (done) => {
  await dropTestDB();
  await closeTestDBConnection();
  done();
});

// Community query
const FIND_COMMUNITY = gql`
  query Community($communityCode: String, $communityId: ID) {
    community(communityCode: $communityCode, communityId: $communityId) {
      _id
      name
      code
      creator {
        _id
      }
      members {
        _id
        name
        image
      }
    }
  }
`;

describe('[Query.communities]', () => {
  it('Get community by community code', async () => {
    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    // Create test interface
    const { query } = createTestClient(server);
    const res = await query({
      query: FIND_COMMUNITY,
      variables: { communityCode: mockCommunity01.code },
    });

    console.log(res.data);
  });
});
