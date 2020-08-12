const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const { sign, verify } = require('jsonwebtoken');
const Redis = require('ioredis-mock');
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const { constructTestServer } = require('./__utils');
const inMemoryDb = require('./__mocks__/inMemoryDb');
const {
  createInitData,
  fcmToken,
  mockUser01,
  mockUser03,
  mockCommunity01,
  mockCommunity02,
  mockUploadResponse,
  updatedMockUploadResponse,
} = require('./__mocks__/createInitData');
const User = require('../models/user');
const Community = require('../models/community');

// Mocking dependencies
jest.mock('../utils/uploadImg');
const uploadImg = require('../utils/uploadImg');

jest.mock('../utils/sendMail/index');
const sendMail = require('../utils/sendMail/index');

// Connect to a new in-memory database before running any tests
// & set enviorment variables
beforeAll(async () => {
  await inMemoryDb.connect();
  process.env = Object.assign(process.env, { JWT_SECRET: 'secret' });
});

// Write initial data to to database
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

const VALIDATE_RESET_LINK = gql`
  query ValidateResetLink($resetKey: String!) {
    validateResetLink(resetKey: $resetKey)
  }
`;

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

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($resetKey: String!, $password: String!) {
    resetPassword(resetKey: $resetKey, password: $password)
  }
`;

const TOKEN_REFRESH = gql`
  mutation TokenRefresh($token: String!) {
    tokenRefresh(token: $token) {
      accessToken
      refreshToken
    }
  }
`;

const ADD_FCM_TOKEN_TO_USER = gql`
  mutation AddFcmToken($fcmToken: String!) {
    addFcmToken(fcmToken: $fcmToken)
  }
`;

/* USERS QUERY */
describe('[Query.users]', () => {
  // USER QUERY
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
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    // Create test interface
    const { query } = createTestClient(server);
    const res = await query({
      query: GET_USER,
    });

    // Check if user response is the same of mockUser01 data
    expect(res.data.user).toMatchObject({
      _id: mockUser01._id.toString(),
      name: mockUser01.name,
      email: mockUser01.email,
      apartment: mockUser01.apartment,
      communities: [
        {
          _id: mockCommunity01._id.toString(),
        },
        {
          _id: mockCommunity02._id.toString(),
        },
      ],
    });
  });

  // VALIDATE_RESET_LINK QUERY
  it('Validate password reset link', async () => {
    const resetKey = crypto.randomBytes(16).toString('hex');

    const redis = new Redis({
      data: {
        [`reset_password:${resetKey}`]: mockUser01._id.toString(),
      },
    });

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    // Create test interface
    const { query } = createTestClient(server);
    const res = await query({
      query: VALIDATE_RESET_LINK,
      variables: { resetKey },
    });

    expect(res.data.validateResetLink).toBeTruthy();
  });

  // VALIDATE_RESET_LINK QUERY WITH INVALID LINK
  it('Validate password reset link with invalid key', async () => {
    const resetKey = crypto.randomBytes(16).toString('hex');

    const redis = new Redis({
      data: {
        [`reset_password:${resetKey}`]: mockUser01._id.toString(),
      },
    });

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    // Create test interface
    const { query } = createTestClient(server);
    const res = await query({
      query: VALIDATE_RESET_LINK,
      variables: { resetKey: 'invalid-key' },
    });

    expect(res.data.validateResetLink).not.toBeTruthy();
  });
});

/* USERS MUTATION */
describe('[Mutation.users]', () => {
  // LOGIN MUTATION { isMigrated: true }
  it('Login migrated user ', async () => {
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
    const accessTokenPayload = verify(
      res.data.login.accessToken,
      process.env.JWT_SECRET
    );
    const refreshTokenPayload = verify(
      res.data.login.refreshToken,
      process.env.JWT_SECRET
    );

    expect(accessTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
      userName: mockUser01.name,
      email: mockUser01.email,
      isAdmin: true,
    });
    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
    });
  });

  // LOGIN MUTATION { isMigrated: false }
  it('Login unmigrated user ', async () => {
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
        email: 'mock.user03@email.com',
        password: '1234567',
      },
    });

    // Register user response should return accessToken & refreshToken strings
    const accessTokenPayload = verify(
      res.data.login.accessToken,
      process.env.JWT_SECRET
    );
    const refreshTokenPayload = verify(
      res.data.login.refreshToken,
      process.env.JWT_SECRET
    );

    expect(accessTokenPayload).toMatchObject({
      userId: mockUser03._id.toString(),
      userName: mockUser03.name,
      email: mockUser03.email,
    });
    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser03._id.toString(),
    });

    const user = await User.findById(mockUser03._id.toString());
    const userhashArr = user.password.split('$');

    // User's migration status should be changed to true
    expect(user).toMatchObject({
      isMigrated: true,
    });

    // User's password hash should not start with 'pbkdf2_sha256'
    expect(userhashArr[0]).not.toEqual('pbkdf2_sha256');
  });

  // LOGIN MUTATION WITH WRONG EMAIL
  it('Login user with wrong email', async () => {
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
        email: 'non.existent@email.com',
        password: '1234567',
      },
    });

    // Expected error comparison
    expect(res.errors[0].message).toEqual('Error: email: User not found');
  });

  // LOGIN MUTATION WITH WRONG PASSWORD
  it('Login user with wrong password', async () => {
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
        password: 'wrongPassword',
      },
    });

    // Expected error comparison
    expect(res.errors[0].message).toEqual(
      'AuthenticationError: password: Invalid credentials'
    );
  });

  // LOGOUT MUTATION
  it('logout user ', async () => {
    const LOGOUT = gql`
      mutation {
        logout
      }
    `;

    const { server } = constructTestServer({
      context: () => ({
        user: {
          userId: mockUser01._id.toString(),
          tokenVersion: mockUser01.tokenVersion,
        },
      }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({ mutation: LOGOUT });

    expect(res.data.logout).toBeTruthy();

    const user = await User.findById(mockUser01._id.toString());

    // User's token version should be incremented
    expect(user.tokenVersion).toEqual(mockUser01.tokenVersion + 1);
  });

  // REGISTER_AND_OR_CREATE_COMMUNITY MUTATION FOR USER & COMMUNITY
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

    // Get created user & community
    const [user, community] = await Promise.all([
      User.findOne({ email: userInput.email }),
      Community.findOne({ code: communityInput.code }),
    ]);

    // Create community response should match input
    expect(res.data.registerAndOrCreateCommunity.community).toMatchObject(
      communityInput
    );

    // Created user should match to userInput
    // && user's communities array should include created community's id
    expect(user).toMatchObject({
      name: userInput.name,
      email: userInput.email,
      communities: expect.arrayContaining([community._id]),
      isAdmin: false,
      isMigrated: true,
      isNotified: true,
    });

    // Created community should match to communityInput
    // && createdCommunity's members array should include created user's id
    // && the created community's creator should be created user's id
    expect(community).toMatchObject({
      ...communityInput,
      members: expect.arrayContaining([user._id]),
      creator: user._id,
    });

    // Register user response should return accessToken & refreshToken strings
    const accessTokenPayload = verify(
      res.data.registerAndOrCreateCommunity.user.accessToken,
      process.env.JWT_SECRET
    );
    const refreshTokenPayload = verify(
      res.data.registerAndOrCreateCommunity.user.refreshToken,
      process.env.JWT_SECRET
    );

    // The returned should contain info related to userInput
    expect(accessTokenPayload).toMatchObject({
      userId: user._id.toString(),
      userName: userInput.name,
      email: userInput.email,
    });
    expect(refreshTokenPayload).toMatchObject({
      userId: user._id.toString(),
    });
  });

  // REGISTER_AND_OR_CREATE_COMMUNITY MUTATION
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
      communityId: mockCommunity01._id.toString(),
      image: uploadImg(),
    };

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: REGISTER_AND_OR_CREATE_COMMUNITY,
      variables: { userInput },
    });

    // Get created user & community
    const [user, community] = await Promise.all([
      User.findOne({ email: userInput.email }),
      Community.findById(mockCommunity01._id.toString()),
    ]);

    // Created user should match to userInput
    // && user's communities array should include created community's id
    expect(user).toMatchObject({
      name: userInput.name,
      email: userInput.email,
      communities: expect.arrayContaining([community._id]),
      isAdmin: false,
      isMigrated: true,
      isNotified: true,
    });

    // Target community's members array should include created user's id
    expect(community).toMatchObject({
      members: expect.arrayContaining([user._id]),
    });

    // Register user response should return accessToken & refreshToken strings
    const accessTokenPayload = verify(
      res.data.registerAndOrCreateCommunity.user.accessToken,
      process.env.JWT_SECRET
    );
    const refreshTokenPayload = verify(
      res.data.registerAndOrCreateCommunity.user.refreshToken,
      process.env.JWT_SECRET
    );

    // The returned should contain info related to userInput
    expect(accessTokenPayload).toMatchObject({
      userId: user._id.toString(),
      userName: userInput.name,
      email: userInput.email,
    });
    expect(refreshTokenPayload).toMatchObject({
      userId: user._id.toString(),
    });
  });

  // UPDATE_USER MUTATION
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
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    // Mock uploadImg function
    uploadImg.mockImplementation(() =>
      JSON.stringify(updatedMockUploadResponse)
    );

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

  // TOKEN_REFRESH MUTATION { token }
  it("Refresh user's accessToken", async () => {
    const refreshToken = sign(
      {
        userId: mockUser01._id.toString(),
        tokenVersion: mockUser01.tokenVersion,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: TOKEN_REFRESH,
      variables: { token: refreshToken },
    });

    const accessTokenPayload = verify(
      res.data.tokenRefresh.accessToken,
      process.env.JWT_SECRET
    );
    const refreshTokenPayload = verify(
      res.data.tokenRefresh.refreshToken,
      process.env.JWT_SECRET
    );

    expect(accessTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
      userName: mockUser01.name,
      email: mockUser01.email,
      isAdmin: true,
    });
    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
    });
  });

  // TOKEN_REFRESH MUTATION { token }
  it("Refresh user's accessToken with revoked refreshToken", async () => {
    const refreshToken = sign(
      {
        userId: mockUser01._id.toString(),
        tokenVersion: mockUser01.tokenVersion - 1,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: TOKEN_REFRESH,
      variables: { token: refreshToken },
    });

    expect(res.errors[0].message).toEqual(
      'AuthenticationError: Please login again'
    );
  });

  // TOKEN_REFRESH MUTATION { token }
  it("Refresh user's accessToken with expired refreshToken", async () => {
    const refreshToken = sign(
      { userId: mockUser01._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: '0s',
      }
    );

    // Create an instance of ApolloServer
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser01._id } }),
    });

    // Create test interface
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: TOKEN_REFRESH,
      variables: { token: refreshToken },
    });

    expect(res.errors[0].message).toEqual(
      'AuthenticationError: Please login again'
    );
  });

  // FORGOT_PASSWORD MUTATION
  it('Create forgot password link', async () => {
    const redis = new Redis();

    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    sendMail.mockImplementation(() => {});

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: FORGOT_PASSWORD,
      variables: { email: mockUser01.email },
    });

    const resetKey = await redis.get(`reset_key:${mockUser01.email}`);
    const userId = await redis.get(`reset_password:${resetKey}`);

    expect(res.data.forgotPassword).toBeTruthy();
    expect(userId).toEqual(mockUser01._id.toString());
  });

  // FORGOT_PASSWORD MUTATION
  it('Resend forgot password link', async () => {
    const resetKey = crypto.randomBytes(16).toString('hex');

    const redis = new Redis({
      data: {
        [`reset_password:${resetKey}`]: mockUser01._id.toString(),
        [`reset_key:${mockUser01.email}`]: resetKey,
      },
    });

    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    sendMail.mockImplementation(() => {});

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: FORGOT_PASSWORD,
      variables: { email: mockUser01.email },
    });

    const userId = await redis.get(`reset_password:${resetKey}`);

    expect(res.data.forgotPassword).toBeTruthy();
    expect(userId).toEqual(mockUser01._id.toString());
  });

  // FORGOT_PASSWORD MUTATION WITH WRONG EMAIL
  it('Forgot password mutation with invalid email', async () => {
    const redis = new Redis();

    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    sendMail.mockImplementation(() => {});

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: FORGOT_PASSWORD,
      variables: { email: 'non.existent@email.com' },
    });

    expect(res.errors[0].message).toEqual('Error: email: User not found');
  });

  // RESET_PASSWORD MUTATION { resetKey, password }
  it('Reset user password', async () => {
    const resetKey = crypto.randomBytes(16).toString('hex');

    const redis = new Redis({
      data: {
        [`reset_password:${resetKey}`]: mockUser01._id.toString(),
        [`reset_key:${mockUser01.email}`]: resetKey,
      },
    });

    const resetPasswordInput = {
      resetKey,
      password: 'new_password',
    };

    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: RESET_PASSWORD,
      variables: resetPasswordInput,
    });

    expect(res.data.resetPassword).toBeTruthy();

    const [userIdKey, existingResetKey, user] = await Promise.all([
      redis.get(`reset_password:${resetKey}`),
      redis.get(`reset_key:${mockUser01.email}`),
      User.findById(mockUser01._id.toString()),
    ]);

    const isPasswordValid = await bcryptjs.compare(
      resetPasswordInput.password,
      user.password
    );

    expect(userIdKey).toBeNull();
    expect(existingResetKey).toBeNull();
    expect(isPasswordValid).toBeTruthy();
  });

  // RESET_PASSWORD MUTATION { resetKey, password }
  it('Reset user password for unmigrated user', async () => {
    const resetKey = crypto.randomBytes(16).toString('hex');

    const redis = new Redis({
      data: {
        [`reset_password:${resetKey}`]: mockUser03._id.toString(),
        [`reset_key:${mockUser03.email}`]: resetKey,
      },
    });

    const resetPasswordInput = {
      resetKey,
      password: 'new_password',
    };

    const { server } = constructTestServer({
      context: () => ({ redis }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: RESET_PASSWORD,
      variables: resetPasswordInput,
    });

    expect(res.data.resetPassword).toBeTruthy();

    const [userIdKey, existingResetKey, user] = await Promise.all([
      redis.get(`reset_password:${resetKey}`),
      redis.get(`reset_key:${mockUser03.email}`),
      User.findById(mockUser03._id.toString()),
    ]);

    const isPasswordValid = await bcryptjs.compare(
      resetPasswordInput.password,
      user.password
    );

    expect(userIdKey).toBeNull();
    expect(existingResetKey).toBeNull();
    expect(isPasswordValid).toBeTruthy();
    expect(user.isMigrated).toBeTruthy();
  });

  // ADD_FCM_TOKEN_TO_USER FOR NEW TOKEN
  it('Add new FCM token to user', async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser03._id.toString() } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: ADD_FCM_TOKEN_TO_USER,
      variables: { fcmToken },
    });

    const user = await User.findById(mockUser03._id.toString());

    expect(res.data.addFcmToken).toBeTruthy();

    expect(user).toMatchObject({
      _id: mockUser03._id,
      email: mockUser03.email,
      fcmTokens: expect.arrayContaining([fcmToken]),
    });
  });

  // ADD_FCM_TOKEN_TO_USER FOR EXISTING TOKEN
  it('Add existing FCM token to user', async () => {
    const { server } = constructTestServer({
      context: () => ({ user: { userId: mockUser03._id.toString() } }),
    });

    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: ADD_FCM_TOKEN_TO_USER,
      variables: { fcmToken },
    });

    const user = await User.findById(mockUser01._id.toString());

    expect(res.data.addFcmToken).toBeTruthy();

    expect(user).toMatchObject({
      _id: mockUser01._id,
      email: mockUser01.email,
      fcmTokens: expect.arrayContaining([fcmToken]),
    });

    // The user's fcmTokens should only contain the existing fcmToken
    expect(user.fcmTokens).toHaveLength(2);
  });
});
