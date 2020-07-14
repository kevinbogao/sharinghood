const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const {
  initTestDB,
  constructTestServer,
  mockUploadResponse,
  updatedMockUploadResponse,
  mockUser01,
  mockUser01Id,
  mockCommunity01,
  mockCommunity01Id,
} = require('../__utils');

// Mocking dependencies
jest.mock('../../utils/uploadImg');
const uploadImg = require('../../utils/uploadImg');

beforeEach(async () => {
  await initTestDB();
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

describe('[Query.users]', () => {
  /**
   * Get user data and user posts
   */
  it('Get user data and user posts', async () => {
    const GET_USER = gql`
      query User {
        user {
          _id
          image
          name
          email
          apartment
          isAdmin
          communities {
            _id
          }
          posts {
            _id
            title
            image
          }
        }
      }
    `;

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    // Create test interface
    const { query } = createTestClient(server);
    const res = await query({
      query: GET_USER,
    });

    // Check if user response is the same of mockUser01 data
    expect(res.data.user).toMatchObject({
      _id: mockUser01Id.toString(),
      name: mockUser01.name,
      email: mockUser01.email,
      apartment: mockUser01.apartment,
      communities: [
        {
          _id: mockCommunity01Id.toString(),
        },
      ],
    });
  });
});

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

    // userInput & communityInput
    const userInput = {
      name: 'TestUser01',
      email: 'test.user01@email.com',
      password: '1234567',
      apartment: '101',
      isNotified: true,
      isCreator: true,
      image: uploadImg(),
    };
    const communityInput = {
      name: 'TestCommunity01',
      code: 'testCommunity01',
      zipCode: '10001',
    };

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: REGISTER_AND_OR_CREATE_COMMUNITY,
      variables: { userInput, communityInput },
    });

    // Create community response should match input
    expect(res.data.registerAndOrCreateCommunity.community).toMatchObject(
      communityInput
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

    const userInput = {
      name: 'TestUser02',
      email: 'test.user02@email.com',
      password: '1234567',
      apartment: '102',
      isNotified: true,
      communityId: mockCommunity01Id.toString(),
      image: uploadImg(),
    };

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: REGISTER_AND_OR_CREATE_COMMUNITY,
      variables: { userInput },
    });

    // Register user response should return accessToken & refreshToken strings
    expect(typeof res.data.registerAndOrCreateCommunity.user.accessToken).toBe(
      'string'
    );
    expect(typeof res.data.registerAndOrCreateCommunity.user.accessToken).toBe(
      'string'
    );
  });

  /**
   * Edit user profile
   */
  it('Update user data', async () => {
    // User update mutation
    const UPDATE_USER = gql`
      mutation UpdateUser($userInput: UserInput) {
        updateUser(userInput: $userInput) {
          _id
          name
          image
          email
          apartment
        }
      }
    `;

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });

    // Mock uploadImg function
    uploadImg.mockImplementation(() => {
      return JSON.stringify(updatedMockUploadResponse);
    });

    // User input for mutation
    const mutationInput = {
      name: 'MockUser01+',
      apartment: '001+',
      image: uploadImg(),
    };

    // Update mockUser01's name, image, apartment
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: UPDATE_USER,
      variables: { userInput: mutationInput },
    });

    // Check if user response the same as mutationInput
    expect(res.data.updateUser).toMatchObject({
      name: mutationInput.name,
      apartment: mutationInput.apartment,
      image: JSON.stringify(updatedMockUploadResponse),
    });
  });
});
