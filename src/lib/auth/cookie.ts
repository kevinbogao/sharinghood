import type { User } from "@prisma/client";
import type { NextApiRequest } from "next";

import { CONFIG } from "../Config";
import { generateCookie } from "../http/cookie";
import { TokenTypeEnum } from "./enums";
import { signJwt, verifyJwt } from "./jwt";
import type { IRefreshTokenPayload } from "./types";

export function verifyAuthCookie<T extends IRefreshTokenPayload = IRefreshTokenPayload>(
  cookies: NextApiRequest["cookies"],
  type: TokenTypeEnum
): T {
  const token = cookies[type] ?? "";
  return verifyJwt(token, type);
}

export function generateAuthCookies({ id, email }: User): [string, string] {
  const isUserAdmin = CONFIG.API.AUTH.ADMIN_IDS.includes(id);
  const accessToken = signJwt(
    { user_id: id, email, ...(isUserAdmin && { is_admin: true }) },
    { expiresIn: CONFIG.API.AUTH.ACCESS_TOKEN_EXPIRATION_PERIOD }
  );
  const refreshToken = signJwt({ user_id: id }, { expiresIn: CONFIG.API.AUTH.REFRESH_TOKEN_EXPIRATION_PERIOD });
  const accessCookie = generateCookie(TokenTypeEnum.ACCESS_TOKEN, accessToken);
  const refreshCookie = generateCookie(TokenTypeEnum.REFRESH_TOKEN, refreshToken);
  return [accessCookie, refreshCookie];
}
