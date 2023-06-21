import type { HttpMethodEnum } from "../http/enums";
import { deepMergeObjects } from "./object";

export interface IRequestInit<TBody = never> extends Omit<RequestInit, "body" | "method"> {
  body?: TBody;
  method?: `${HttpMethodEnum}`;
}

export interface IFetchDefaults extends Pick<RequestInit, "credentials"> {
  baseURL?: string;
}

export async function request<TData = unknown, TBody = never>(
  url: string,
  { body, method, ...init }: IRequestInit<TBody> = {},
  { baseURL, ...defaults }: IFetchDefaults = {}
): Promise<TData> {
  const defaultHeaders = { "Content-Type": "application/json" };
  const fetchUrl = baseURL ? `${baseURL}${url}` : url;

  const res = await fetch(fetchUrl, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    ...deepMergeObjects(defaults, { headers: defaultHeaders }, init),
  });
  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
