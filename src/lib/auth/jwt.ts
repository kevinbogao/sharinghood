import { createHmac } from "crypto";

import { CONFIG } from "../Config";
import { ResponseErrorCodeEnum } from "../http/enums";
import { AuthenticationError } from "../http/errors";
import { TokenTypeEnum } from "./enums";
import type { IJwt, IRefreshTokenPayload } from "./types";

const ALGORITHM = "HS256";

function toBase64(input: string, encoding: BufferEncoding): string {
  return Buffer.from(input, encoding).toString("base64").replace(/[=]/gu, "").replace(/\+/gu, "-").replace(/\//gu, "_");
}

function hmacSign(input: string, secret: string): string {
  const hmac = createHmac("sha256", secret);
  const sig = (hmac.update(input), hmac.digest("base64"));
  return sig.replace(/[=]/gu, "").replace(/\+/gu, "-").replace(/\//gu, "_");
}

function hmacVerify(input: string, signature: string, secret: string): boolean {
  const computedSig = hmacSign(input, secret);
  return signature === computedSig;
}

function decode(token: string): IJwt | null {
  // eslint-disable-next-line
  const JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

  try {
    const isValidToken = JWS_REGEX.test(token);
    if (!isValidToken) {
      return null;
    }

    const [headerStr, payloadStr, signature] = token.split(".") as [string, string, string];
    const headerJsonStr = Buffer.from(headerStr, "base64").toString("binary");
    const header = JSON.parse(headerJsonStr) as IJwt["header"];

    if (header.typ !== "JWT") {
      return null;
    }

    const payloadJsonStr = Buffer.from(payloadStr, "base64").toString("utf8");
    const payload = JSON.parse(payloadJsonStr);

    return { header, payload, signature };
  } catch (err) {
    return null;
  }
}

export function validate(token: string, secretOrKey: string): boolean {
  const [header, payload, signature] = token.split(".") as [string, string, string];
  const securedInput = [header, payload].join(".");
  return hmacVerify(securedInput, signature, secretOrKey);
}

interface ISignOptions {
  expiresIn?: number;
}

// TODO: COOKIE attrs
export function signJwt<T extends IRefreshTokenPayload = IRefreshTokenPayload>(
  payload: T,
  { expiresIn }: ISignOptions = {}
): string {
  const iat = Math.floor(Date.now() / 1000);
  const header = { alg: ALGORITHM, typ: "JWT" };

  const encodedHeader = toBase64(JSON.stringify(header), "binary");
  const encodedPayload = toBase64(
    JSON.stringify({
      ...payload,
      iat,
      ...(expiresIn && { exp: Math.floor(iat + expiresIn / 1000) }),
    }),
    "utf8"
  );

  const securedInput = `${encodedHeader}.${encodedPayload}`;
  const signature = hmacSign(securedInput, CONFIG.SERVER.JWT_SECRET);
  return `${securedInput}.${signature}`;
}

export function verifyJwt<T extends IRefreshTokenPayload = IRefreshTokenPayload>(token: string, type: string): T {
  try {
    const valid = validate(token, CONFIG.SERVER.JWT_SECRET);
    if (!valid) {
      throw new Error("Invalid JWT signature");
    }

    const payload = decode(token)?.payload as T;
    if (!payload.exp || typeof payload.exp !== "number") {
      throw new Error("Invalid JWT exp value");
    }

    if (Math.floor(Date.now() / 1000) >= payload.exp) {
      throw new Error("JWT expired");
    }

    return payload;
  } catch (_) {
    if (type === TokenTypeEnum.REFRESH_TOKEN) {
      throw new AuthenticationError("Refresh token is Invalid", {
        code: ResponseErrorCodeEnum.INVALID_REFRESH_TOKEN,
      });
    }

    throw new AuthenticationError("Access token is Invalid", {
      code: ResponseErrorCodeEnum.INVALID_ACCESS_TOKEN,
    });
  }
}
