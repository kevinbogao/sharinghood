import { sign, verify } from "jsonwebtoken";
import { UserDocument } from "../models/user";

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

export interface UserTokenContext
  extends Omit<RefreshTokenPayload, "tokenVersion"> {
  userName: string;
  email: string;
  isAdmin?: boolean;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(user: UserDocument): GeneratedTokens {
  const refreshToken = sign(
    { userId: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  const accessToken = sign(
    {
      userId: user._id,
      userName: user.name,
      email: user.email,
      ...(user.isAdmin && { isAdmin: true }),
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "30m" }
  );

  // Return accessToken & refreshToken
  return { accessToken, refreshToken };
}

export function verifyToken(
  token: string
): RefreshTokenPayload | UserTokenContext | null {
  try {
    return verify(token, process.env.JWT_SECRET as string) as
      | (RefreshTokenPayload | UserTokenContext)
      | null;
  } catch (err) {
    return null;
  }
}
