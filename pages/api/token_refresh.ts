import { User } from "../../api/entities";
import { verifyToken, generateTokens } from "../../lib/auth";
import { prepareConnection } from "../../lib/db";
import type { RefreshToken } from "../../lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connection = await prepareConnection();

  const token = req.headers.authorization?.split(" ")[1] ?? "";
  if (!token) res.status(500).json({ error: "Refresh token not provided" });
  const tokenPayload = verifyToken<RefreshToken>(token);
  if (!tokenPayload) return res.status(500).json({ error: "Invalid token" });

  const user = await connection.getRepository(User).findOne({
    where: { id: tokenPayload.userId },
  });

  if (!user || user.tokenVersion !== tokenPayload.tokenVersion)
    return res.status(500).json({ error: "Please login again" });

  const tokens = generateTokens(user);

  res.status(200).json({ tokens });

  user.lastLogin = new Date();
  await connection.manager.save(user);
}
