import { CONFIG } from "../Config";

export interface ICookieSerializeOptions {
  domain?: string;
  expires?: Date;
  path?: string;
  sameSite?: "lax" | "none" | "strict" | false | true;
  maxAge?: number;
  secure?: boolean | undefined;
  httpOnly?: boolean;
}

export function serialiseCookie(
  name: string,
  value: string,
  { path, expires, maxAge, domain, secure, httpOnly, sameSite }: ICookieSerializeOptions = {}
): string {
  const attrs = [
    path && `Path=${path}`,
    expires && `Expires=${expires.toUTCString()}`,
    maxAge && `Max-Age=${maxAge}`,
    domain && `Domain=${domain}`,
    secure && "Secure",
    httpOnly && "HttpOnly",
    sameSite && `SameSite=${sameSite}`,
  ].filter(Boolean);

  return `${name}=${encodeURIComponent(value)}; ${attrs.join("; ")}`;
}

export function generateCookie(key: string, value: string, options: ICookieSerializeOptions = {}): string {
  return serialiseCookie(key, value, { ...CONFIG.API.COOKIE, ...options });
}

export function removeCookies(...keys: Array<string>): Array<string> {
  return keys.map((key) => generateCookie(key, "deleted", { expires: new Date(0), maxAge: -1 }));
}
