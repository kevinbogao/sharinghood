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

// Register & community mutation
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

  /**
   * Register user to existing community
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

    // Check community response
    expect(res.data.community).toMatchObject({
      name: mockCommunity01.name,
      code: mockCommunity01.code,
      creator: {
        _id: mockUser01Id.toString(),
      },
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

  it('Join community for registered user', async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01Id } }),
    });
    const { mutate } = createTestClient(server);
  });
});
