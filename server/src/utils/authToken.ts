import { sign, verify } from "jsonwebtoken";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  tokenVersion: number;
}

interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(user: User): GeneratedTokens {
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

export function verifyToken(token: string): User | null {
  try {
    if (token) return verify(token, process.env.JWT_SECRET as string) as User;
    return null;
  } catch (err) {
    return null;
  }
}
