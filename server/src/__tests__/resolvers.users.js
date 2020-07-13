const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { constructTestServer } = require('./__utils');
const {
  connectToTestDB,
  dropTestDB,
  closeTestDBConnection,
  mockUploadResponse,
  // mockUser01Id,
  // mockCommunity01Id,
  mockCommunityCreatorUserInput,
  mockRegisterUserCommunityInput,
  mockExistingCommunityUserInput,
} = require('./database/setup');

// Mocking dependencies
jest.mock('../utils/uploadImg');
const uploadImg = require('../utils/uploadImg');

beforeAll(async (done) => {
  await connectToTestDB();
  done();
});

afterAll(async (done) => {
  await dropTestDB();
  await closeTestDBConnection();
  done();
});

const REGISTER_AND_OR_CREATE_COMMUNITY = gql`
  mutation RegisterAndOrCreateCommunity(
    $userInput: UserInput!
    $communityInput: CommunityInput
  ) {
    registerAndOrCreateCommunity(
      communityInput: $communityInput
      userInput: $userInput
    ) {
      user {
        accessToken
        refreshToken
      }
      community {
        _id
        name
        code
        zipCode
        creator {
          _id
        }
      }
    }
  }
`;

describe('[Mutation.users]', () => {
  /**
   * Login registered user
   */
  it('Login user', async () => {
    // Login mutation
    const LOGIN = gql`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          accessToken
          refreshToken
        }
      }
    `;

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => {},
    });

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: LOGIN,
      variables: {
        email: 'mock.user01@email.com',
        password: '1234567',
      },
    });

    // Register user response should return accessToken & refreshToken strings
    expect(typeof res.data.login.accessToken).toBe('string');
    expect(typeof res.data.login.accessToken).toBe('string');
  });

  /**
   * Register user & create community
   */
  it('Register user and create community', async () => {
    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => {},
    });

    // Mock uploadImg function
    uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: REGISTER_AND_OR_CREATE_COMMUNITY,
      variables: {
        userInput: {
          ...mockCommunityCreatorUserInput,
          image: uploadImg(),
        },
        communityInput: mockRegisterUserCommunityInput,
      },
    });

    // Create community response should match input
    expect(res.data.registerAndOrCreateCommunity.community).toMatchObject(
      mockRegisterUserCommunityInput
    );

    // Register user response should return accessToken & refreshToken strings
    expect(typeof res.data.registerAndOrCreateCommunity.user.accessToken).toBe(
      'string'
    );
    expect(typeof res.data.registerAndOrCreateCommunity.user.accessToken).toBe(
      'string'
    );
  });

  /**
   * Register user to existing community
   */
  it('Register user to existing community', async () => {
    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => {},
    });

    // Mock uploadImg function
    uploadImg.mockImplementation(() => JSON.stringify(mockUploadResponse));

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: REGISTER_AND_OR_CREATE_COMMUNITY,
      variables: {
        userInput: {
          ...mockExistingCommunityUserInput,
          image: uploadImg(),
        },
      },
    });

    // Register user response should return accessToken & refreshToken strings
    expect(typeof res.data.registerAndOrCreateCommunity.user.accessToken).toBe(
      'string'
    );
    expect(typeof res.data.registerAndOrCreateCommunity.user.accessToken).toBe(
      'string'
    );
  });
});
