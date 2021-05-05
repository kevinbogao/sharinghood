import { makeVar } from "@apollo/client";
import jwtDecode from "jwt-decode";

export interface TokenPayload {
  email: string;
  exp: number;
  iat: number;
  isAdmin?: Boolean;
  userId: string;
  userName: string;
}

const accessToken = localStorage.getItem("@sharinghood:accessToken");
const refreshToken = localStorage.getItem("@sharinghood:refreshToken");
const selCommunityId = localStorage.getItem("@sharinghood:selCommunityId");

export const serverErrorVar = makeVar<boolean>(false);
export const accessTokenVar = makeVar<string | null>(accessToken);
export const refreshTokenVar = makeVar<string | null>(refreshToken);
export const selCommunityIdVar = makeVar<string | null>(selCommunityId);
export const tokenPayloadVar = makeVar<TokenPayload | null>(
  accessToken ? jwtDecode(accessToken) : null
);

export function clearLocalStorageAndCache() {
  // Remove localStorage items
  localStorage.removeItem("@sharinghood:accessToken");
  localStorage.removeItem("@sharinghood:refreshToken");
  localStorage.removeItem("@sharinghood:selCommunityId");

  // Reset reactive variables
  accessTokenVar(null);
  refreshTokenVar(null);
  tokenPayloadVar(null);
  selCommunityIdVar(null);
}
