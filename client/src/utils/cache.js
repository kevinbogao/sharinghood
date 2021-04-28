import { makeVar } from "@apollo/client";
import jwtDecode from "jwt-decode";

const accessToken = localStorage.getItem("@sharinghood:accessToken");

export const accessTokenVar = makeVar(accessToken);

export const refreshTokenVar = makeVar(
  localStorage.getItem("@sharinghood:refreshToken")
);

export const tokenPayloadVar = makeVar(
  accessToken ? jwtDecode(accessToken) : null
);

export const selCommunityIdVar = makeVar(
  localStorage.getItem("@sharinghood:selCommunityId")
);

export const serverErrorVar = makeVar(false);

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
