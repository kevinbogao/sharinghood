/* eslint-disable no-process-env */

import type { InfoObject } from "openapi3-ts";

import type { ICookieSerializeOptions } from "./http/cookie";
import type { ICorsConfig } from "./http/types";

interface IConfig {
  SERVER: {
    JWT_SECRET: string;
    NODE_ENV: string;
    RUNTIME_ENVIRONMENT: RuntimeEnvironmentEnum;
    LOGTAIL_SOURCE_TOKEN: string;
  };
  DATABASE: {
    REDIS_URI: string;
    REDIS_REST_URL: string;
    REDIS_REST_TOKEN: string;
  };
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  API: {
    AUTH: {
      PASSWORD_HASH_SALT: number;
      RESET_PASSWORD_CODE_LENGTH: number;
      RESET_PASSWORD_CODE_EXPIRATION_PERIOD: number;
      ACCESS_TOKEN_EXPIRATION_PERIOD: number;
      REFRESH_TOKEN_EXPIRATION_PERIOD: number;
      CONNECT_WALLET_MESSAGE: string;
      ADMIN_IDS: Array<string>;
    };
    CORS: ICorsConfig;
    COOKIE: ICookieSerializeOptions;
    OPENAPI: {
      info: InfoObject;
      USER_AGENT: string;
      API_PATH: string;
    };
    PAGINATION: {
      DEFAULT_SKIP: number;
      DEFAULT_TAKE: number;
    };
  };
  SOCKET: {
    PORT: number;
  };
}

export enum RuntimeEnvironmentEnum {
  PROD = "prod",
  STAGE = "stage",
  LOCAL = "local",
}

export const CONFIG: IConfig = {
  SERVER: {
    JWT_SECRET: process.env.JWT_SECRET as string,
    NODE_ENV: process.env.NODE_ENV,
    RUNTIME_ENVIRONMENT: (process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT ??
      RuntimeEnvironmentEnum.LOCAL) as RuntimeEnvironmentEnum,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN as string,
  },
  DATABASE: {
    REDIS_URI: process.env.REDIS_URI as string,
    REDIS_REST_URL: process.env.REDIS_REST_URL as string,
    REDIS_REST_TOKEN: process.env.REDIS_REST_TOKEN as string,
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    API_KEY: process.env.CLOUDINARY_API_KEY as string,
    API_SECRET: process.env.CLOUDINARY_SECRET_KEY as string,
  },
  API: {
    AUTH: {
      PASSWORD_HASH_SALT: 12,
      RESET_PASSWORD_CODE_LENGTH: 16,
      RESET_PASSWORD_CODE_EXPIRATION_PERIOD: 60 * 20,
      ACCESS_TOKEN_EXPIRATION_PERIOD: 60 * 60 * 1000,
      REFRESH_TOKEN_EXPIRATION_PERIOD: 15 * 24 * 60 * 60 * 1000,
      CONNECT_WALLET_MESSAGE: "I am signing this message with a unique one-time nonce.",
      ADMIN_IDS: ["cldp4w7t30005hw73byhaxbdl"],
    },
    COOKIE: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
    CORS: {
      origins: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      maxAge: 24 * 60 * 60 * 1000,
      credentials: true,
    },
    OPENAPI: {
      info: { title: "Sharinghood API", version: "1.0.0" },
      USER_AGENT: "sharinghood-api-doc",
      API_PATH: "/openapi",
    },
    PAGINATION: {
      DEFAULT_SKIP: 0,
      DEFAULT_TAKE: 10,
    },
  },
  SOCKET: {
    PORT: 3001,
  },
};
