import type { PrismaClient } from "@prisma/client";
import type { Redis } from "@upstash/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import type { z, ZodTypeAny } from "zod";

import type { IAccessTokenPayload } from "../auth/types";
import type { ApiLogger } from "../logger/ApiLogger";
import type { HttpStatusCodeEnum } from "./enums";
import type { IResponseError } from "./errors";

type TTupleTypes<T> = { [P in keyof T]: T[P] } extends Record<number, infer V> ? V : never;
type TUnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export interface IContext {
  prisma: PrismaClient;
  redis: Redis;
  logger: ApiLogger;
  user?: IAccessTokenPayload;
}

export interface IAuthContext extends IContext {
  user: IAccessTokenPayload;
}

export type TMiddleware<TCtx = any> = (req: INextApiRequest) => Promise<TCtx> | TCtx;

export type TSchemaReturnType<T> = T extends ZodTypeAny ? z.infer<T> : never;

export interface IHandlerResponse<TData = unknown> {
  status?: HttpStatusCodeEnum;
  headers?: Record<string, ReadonlyArray<string> | number | string>;
  body?: TData;
}

interface IHandlerError extends Pick<IResponseError, "causes" | "code"> {
  message?: string;
}

export interface IErrorProps {
  status: HttpStatusCodeEnum;
  errors: Array<IHandlerError>;
}

export interface INextApiRequest<TCtx = IContext, TQuery = never, TBody = never>
  extends Omit<NextApiRequest, "body" | "query"> {
  ctx: TCtx;
  query: TQuery;
  body: TBody;
}

export type THandler<TCtx extends IContext = IContext, TQuery = never, TBody = never, TData = unknown> = (
  req: INextApiRequest<TCtx, TQuery, TBody>,
  res: NextApiResponse
) => IHandlerResponse<TData> | Promise<IHandlerResponse<TData>>;

export interface IHandlerSchema<TQuerySchema = ZodTypeAny, TBodySchema = ZodTypeAny, TDataSchema = ZodTypeAny> {
  query?: TQuerySchema;
  body?: TBodySchema;
  response?: TDataSchema;
  summary: string;
}

export interface IRouteConfig {
  fns: Array<TMiddleware>;
  schema?: IHandlerSchema;
}

export interface IRouteHandler extends IRouteConfig {
  handler: THandler<any>;
}

export type TApiHandler = (req: INextApiRequest, res: NextApiResponse) => Promise<void>;

export interface IInternalApiError {
  errors: Array<IResponseError>;
}

// @ts-expect-error FIXME: type error
export type TIntersectTupleReturn<T> = TUnionToIntersection<Awaited<ReturnType<TTupleTypes<T>>>>;

export interface ICorsConfig {
  origins?: Array<string> | "*";
  methods?: Array<string>;
  maxAge?: number;
  credentials?: boolean;
}
