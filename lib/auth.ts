import { sign, verify } from "jsonwebtoken";
import { User } from "../api/entities";
import { Auth } from "./types";

export function generateTokens(user: User): Auth {
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
