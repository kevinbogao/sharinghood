const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('../__utils');
const inMemoryDb = require('../__fixtures__/inMemoryDb');
const {
  createInitData,
  mockUser01,
  mockUser02,
  mockCommunity01,
} = require('../__fixtures__/createInitData');

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

/* COMMUNITIES QUERY */
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

    // Check members' array in community response
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

  // it("Get user's communities", async () => {
  //   const GET_USER_COMMUNITIES = gql`
  //     query Communities {
  //       communities {
  //         _id
  //         name
  //         hasNotifications
  //       }
  //     }
  //   `;

  //   // Create an instance of ApolloServer
  //   const { server } = constructTestServer({
  //     context: () => ({ user: { userId: mockUser01Id } }),
  //   });

  //   // Create test interface
  //   const { query } = createTestClient(server);
  //   const res = await query({
  //     query: GET_USER_COMMUNITIES,
  //   });

  //   console.log(res.data);

  //   // // Check community response
  //   // expect(res.data.community).toMatchObject({
  //   //   name: mockCommunity01.name,
  //   //   code: mockCommunity01.code,
  //   // });

  //   // // Check members's array in community response
  //   // expect(res.data.community.members).toEqual(
  //   //   expect.arrayContaining([
  //   //     expect.objectContaining({
  //   //       _id: expect.any(String),
  //   //       name: expect.any(String),
  //   //       image: expect.any(String),
  //   //     }),
  //   //   ])
  //   // );
  // });
});

/* COMMUNITIES MUTATIONS */
describe('[Mutation.communities]', () => {
  // communities resolvers
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
      context: () => ({ user: { userId: mockUser01._id } }),
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
        _id: mockUser01._id.toString(),
      },
    });
  });

  // JOIN_COMMUNITY RESOLVER
  it('Join community for registered user', async () => {
    const JOIN_COMMUNITY = gql`
      mutation JoinCommunity($communityId: ID!) {
        joinCommunity(communityId: $communityId) {
          _id
          name
        }
      }
    `;

    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser02._id } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: JOIN_COMMUNITY,
      variables: { communityId: mockCommunity01._id.toString() },
    });

    expect(res.data.joinCommunity).toMatchObject({
      _id: mockCommunity01._id.toString(),
      name: mockCommunity01.name,
    });
  });
});
