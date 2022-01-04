import { getConnection } from "typeorm";
import { User } from "../../api/entities";
import { prepareConnection } from ".";
import { verifyToken, generateTokens } from "../../lib/auth";
import type { RefreshToken } from "../../lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await prepareConnection();
  const connection = getConnection();

  const token = req.headers.authorization?.split(" ")[1] ?? "";
  if (!token) res.status(500).json({ error: "Refresh token not provided" });
  const tokenPayload = verifyToken<RefreshToken>(token);
  if (!tokenPayload) return res.status(500).json({ error: "Invalid token" });

  const user = await connection.getRepository(User).findOne({
    where: { id: tokenPayload.userId },
    select: ["id", "tokenVersion"],
  });

  if (!user || user.tokenVersion !== tokenPayload.tokenVersion)
    return res.status(500).json({ error: "Please login again" });

  const { accessToken, refreshToken } = generateTokens(user);

  res.status(200).json({
    tokens: {
      accessToken,
      refreshToken,
    },
  });

  user.lastLogin = new Date();
  await connection.manager.save(user);
}
