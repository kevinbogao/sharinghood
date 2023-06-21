/* eslint-disable no-process-env */

import { RuntimeEnvironmentEnum } from "../Config";

const { NODE_ENV } = process.env;
const LOCAL_API_URL = NODE_ENV === "production" ? "http://127.0.0.1:3000/api" : "http://localhost:3000/api";

export const appConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API_URL,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001",
  runtimeEnvironment: (process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT ??
    RuntimeEnvironmentEnum.LOCAL) as RuntimeEnvironmentEnum,
  toastCloseDelay: 3.5 * 1000,
  pagination: {
    postDefaultTake: 10,
  },
  socket: {
    reconnectionAttempts: 1,
  },
  exposedRoutes: [
    "/login",
    "/register",
    "/communities/create",
    "/communities/[code]",
    "/account/forgot-password",
    "/account/reset/[code]",
  ] as Array<string>,
  cookie: {
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  },
  cookieKeys: {
    communityId: "community_id",
  },
  imagePlaceholderPath: {
    item: "/item-placeholder.png",
    profile: "/profile-placeholder.png",
  },
  format: {
    date: "dd.MM.yy",
    dateTime: "",
  },
} as const;
