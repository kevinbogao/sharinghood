import { sign, verify } from "jsonwebtoken";
import { User } from "../api/entities";

export interface RefreshToken {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

export interface AccessToken extends Omit<RefreshToken, "tokenVersion"> {
  userName: string;
  email: string;
  isAdmin?: boolean;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(user: User): GeneratedTokens {
  const refreshToken = sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const accessToken = sign(
    {
      userId: user.id,
      userName: user.name,
      email: user.email,
      ...(user.isAdmin && { isAdmin: true }),
    },
    process.env.JWT_SECRET!,
    { expiresIn: "30m" }
  );

  return { accessToken, refreshToken };
}

export function verifyToken<T>(token: string): T | null {
  try {
    return <T>verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
}
