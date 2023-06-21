import type { User } from "@prisma/client";

export interface IJwtHeader {
  alg: string;
  typ?: string;
  cty?: string;
  kid?: string;
  jku?: string;
  x5u?: Array<string> | string;
  "x5t#S256"?: string;
  x5t?: string;
  x5c?: Array<string> | string;
}

export interface IJwtPayload {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: Array<string> | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export interface IJwt {
  header: IJwtHeader;
  payload: IJwtPayload | string;
  signature: string;
}

export interface IRefreshTokenPayload extends IJwtPayload {
  user_id: User["id"];
}

export interface IAccessTokenPayload extends IRefreshTokenPayload, Pick<User, "email"> {
  is_admin?: boolean;
}
