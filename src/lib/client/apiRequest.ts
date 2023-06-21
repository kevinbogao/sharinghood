import type { GetServerSidePropsContext } from "next";

import { ResponseErrorCodeEnum } from "../http/enums";
import type { IFetchDefaults, IRequestInit } from "../utils/request";
import { request } from "../utils/request";
import { appConfig } from "./appConfig";
import { isServerError } from "./error";

export const apiRequest = async <TData = unknown, TBody = never>(
  url: string,
  init: IRequestInit<TBody> = {}
): Promise<TData> => {
  const defaults: IFetchDefaults = { baseURL: appConfig.apiUrl, credentials: "include" };
  try {
    return await request<TData, TBody>(url, init, defaults);
  } catch (err) {
    // Try to refresh access token if response code is "INVALID_ACCESS_TOKEN"
    if (isServerError(err) && err.errors[0]?.code === ResponseErrorCodeEnum.INVALID_ACCESS_TOKEN) {
      const data = await apiRequest("/auth/refresh", { method: "POST" });
      if (!isServerError(data)) {
        return request<TData, TBody>(url, init, defaults);
      }
    }
    throw err;
  }
};

export const apiRequestSSR = async <TData = unknown, TBody = never>(
  req: GetServerSidePropsContext["req"],
  url: string,
  init: IRequestInit<TBody> = {}
): Promise<TData | null> => {
  const defaults: IFetchDefaults = { baseURL: appConfig.apiUrl, credentials: "include" };
  try {
    return await request<TData, TBody>(url, { ...init, headers: { cookie: req.headers.cookie ?? "" } }, defaults);
  } catch (_) {
    return null;
  }
};
