const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const {
  constructTestServer,
  mockUser01Id,
  mockCommunity01,
  initTestDB,
} = require('../__utils');

beforeEach(async () => {
  await initTestDB();
});

// Community query
const FIND_COMMUNITY = gql`
  query Community($communityCode: String, $communityId: ID) {
    community(communityCode: $communityCode, communityId: $communityId) {
      _id
      name
      code
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
      context: () => {},
    });

    // Create test interface
    const { query } = createTestClient(server);
    const res = await query({
      query: FIND_COMMUNITY,
      variables: { communityCode: mockCommunity01.code },
    });

    // Check community response
    expect(res.data.community).toMatchObject({
      name: mockCommunity01.name,
      code: mockCommunity01.code,
    });

    // Check members's array in community response
    expect(res.data.community.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          image: expect.any(String),
        }),
      ])
    );
  });
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
    const communityInput = {
      name: 'TestCommunity01',
      code: 'testCommunity01',
      zipCode: '10001',
    };

    // Create test instance
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: CREATE_COMMUNITY,
      variables: { communityInput },
    });

    // Check create community response against mutation input
    expect(res.data.createCommunity).toMatchObject({
      name: communityInput.name,
      code: communityInput.code,
      zipCode: communityInput.zipCode,
      creator: {
        _id: mockUser01Id.toString(),
      },
    });
  });

  // it('Join community for registered user', async () => {
  //   const { server } = constructTestServer({
  //     context: () => ({ user: { userId: mockUser01Id } }),
  //   });
  //   const { mutate } = createTestClient(server);
  // });
});
