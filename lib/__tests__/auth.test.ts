import { sign, verify } from "jsonwebtoken";
import { mockUser01 } from "../../api/__tests__/__mocks__/initData";
import {
  verifyToken,
  generateTokens,
  AccessToken,
  RefreshToken,
} from "../auth";

beforeAll(() => {
  process.env = Object.assign(process.env, { JWT_SECRET: "secret" });
});

/* AUTH_TOKEN UTILS */
describe("[lib.auth]", () => {
  // GENERATE_TOKENS
  it("Should generate access token and refresh token", () => {
    const { accessToken, refreshToken } = generateTokens(mockUser01);
    const accessTokenPayload = verify(accessToken, process.env.JWT_SECRET!);
    expect(accessTokenPayload).toMatchObject({
      userId: mockUser01.id,
      userName: mockUser01.name,
      email: mockUser01.email,
      isAdmin: mockUser01.isAdmin,
    });
    const refreshTokenPayload = verify(refreshToken, process.env.JWT_SECRET!);
    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser01.id,
      tokenVersion: mockUser01.tokenVersion,
    });
  });

  // VERIFY_ACCESS_TOKEN
  it("Should validate access token", () => {
    const accessToken = sign(
      {
        userId: mockUser01.id,
        userName: mockUser01.name,
        email: mockUser01.email,
        ...(mockUser01.isAdmin && { isAdmin: true }),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" }
    );

    const accessTokenPayload = verifyToken<AccessToken>(accessToken);

    expect(accessTokenPayload).toMatchObject({
      userId: mockUser01.id,
      userName: mockUser01.name,
      email: mockUser01.email,
      ...(mockUser01.isAdmin && { isAdmin: mockUser01.isAdmin }),
    });
  });

  // VERIFY_REFRESH_TOKEN
  it("Should validate refresh token", () => {
    const refreshToken = sign(
      { userId: mockUser01.id, tokenVersion: mockUser01.tokenVersion },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    const refreshTokenPayload = verifyToken<RefreshToken>(refreshToken);
    expect(refreshTokenPayload).toMatchObject({
      userId: mockUser01.id,
      tokenVersion: mockUser01.tokenVersion,
    });
  });

  // VERIFY_TOKEN
  it("Should return null for invalid token", () => {
    const invalidToken = sign(
      {
        userId: mockUser01.id,
        userName: mockUser01.name,
        email: mockUser01.email,
        ...(mockUser01.isAdmin && { isAdmin: true }),
      },
      "fake_jwt_secret",
      { expiresIn: "1h" }
    );
    const invalidTokenPayload = verifyToken(invalidToken);
    expect(invalidTokenPayload).toBeNull();
  });

  // VERIFY_TOKEN
  it("Should return null for expired token", () => {
    const expiredToken = sign(
      {
        userId: mockUser01.id,
        userName: mockUser01.name,
        email: mockUser01.email,
        ...(mockUser01.isAdmin && { isAdmin: true }),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "0s" }
    );
    const expiredTokenPayload = verifyToken(expiredToken);
    expect(expiredTokenPayload).toBeNull();
  });
});
