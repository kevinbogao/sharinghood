const { sign, verify } = require('jsonwebtoken');
const { generateTokens, verifyToken } = require('../authToken');
const { mockUser01 } = require('../../__tests__/__mocks__/createInitData');

// Set enviorment variables
beforeAll(() => {
  process.env = Object.assign(process.env, { JWT_SECRET: 'secret' });
});

/* AUTH_TOKEN UTILS */
describe('[Utils.authToken]', () => {
  // GENERATE_TOKENS
  it('Should generate accessToken and refreshToken', () => {
    const { accessToken, refreshToken } = generateTokens(mockUser01);

    const accessTokenPayload = verify(accessToken, process.env.JWT_SECRET);
    const refreshTokenPayload = verify(refreshToken, process.env.JWT_SECRET);

    expect(accessTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
      userName: mockUser01.name,
      email: mockUser01.email,
    });

    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
    });
  });

  // VERIFY_TOKEN
  it('Should validate accessToken', () => {
    const accessToken = sign(
      {
        userId: mockUser01._id.toString(),
        userName: mockUser01.name,
        email: mockUser01.email,
        ...(mockUser01.isAdmin && { isAdmin: true }),
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const accessTokenPayload = verifyToken(accessToken);

    expect(accessTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
      userName: mockUser01.name,
      email: mockUser01.email,
    });
  });

  // VERIFY_TOKEN
  it('Should validate refreshToken', () => {
    const refreshToken = sign(
      { userId: mockUser01._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );
    const refreshTokenPayload = verifyToken(refreshToken);

    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser01._id.toString(),
    });
  });

  // VERIFY_TOKEN
  it('Should return null for invalid token', () => {
    const invalidToken = sign(
      {
        userId: mockUser01._id.toString(),
        userName: mockUser01.name,
        email: mockUser01.email,
      },
      'fake_jwt_secret',
      { expiresIn: '1h' }
    );

    const invalidTokenPayload = verifyToken(invalidToken);

    expect(invalidTokenPayload).toBeNull();
  });

  // VERIFY_TOKEN
  it('Should return null for expired token', () => {
    const expiredToken = sign(
      {
        userId: mockUser01._id.toString(),
        userName: mockUser01.name,
        email: mockUser01.email,
      },
      'fake_jwt_secret',
      { expiresIn: '0s' }
    );

    const expiredTokenPayload = verifyToken(expiredToken);

    expect(expiredTokenPayload).toBeNull();
  });
});
