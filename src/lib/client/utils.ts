import { serialiseCookie } from "../http/cookie";
import { appConfig } from "./appConfig";

const getDocument = (): Document | undefined => (typeof document === "undefined" ? undefined : document);

export const setCookie = (key: string, value: string): void => {
  const doc = getDocument();
  if (doc) {
    const cookie = serialiseCookie(key, value, appConfig.cookie);
    doc.cookie = cookie;
  }
};

export const getCookie = (key: string): string | undefined => {
  const doc = getDocument();
  const cookies = doc?.cookie.split("; ") ?? [];
  for (const cookie of cookies) {
    const [k, v] = cookie.split("=");
    if (k === key) {
      return v;
    }
  }
};

export const removeCookie = (key: string): void => {
  const doc = getDocument();
  if (doc) {
    const cookie = serialiseCookie(key, "deleted", {
      ...appConfig.cookie,
      expires: new Date(0),
      maxAge: -1,
    });
    doc.cookie = cookie;
  }
};
