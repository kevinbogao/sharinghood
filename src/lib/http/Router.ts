import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { createKey } from "next/dist/shared/lib/router/router";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

import { verifyAuthCookie } from "../auth/cookie";
import { TokenTypeEnum } from "../auth/enums";
import { verifyJwt } from "../auth/jwt";
import type { IAccessTokenPayload } from "../auth/types";
import { CONFIG } from "../Config";
import { prisma } from "../db/prisma";
import { redis } from "../db/redis";
import { HttpMethodEnum, HttpStatusCodeEnum, ResponseErrorCodeEnum } from "../http/enums";
import { ResponseError } from "../http/errors";
import { ApiLogger } from "../logger/ApiLogger";
import { logtail } from "../logger/logtail";
import type { ValidatorReasonEnum } from "../schema/enums";
import { parseOpenApiPathItem } from "./openapi";
import type {
  IAuthContext,
  IContext,
  ICorsConfig,
  IErrorProps,
  IHandlerResponse,
  IHandlerSchema,
  INextApiRequest,
  IRouteConfig,
  IRouteHandler,
  TApiHandler,
  THandler,
  TIntersectTupleReturn,
  TMiddleware,
  TSchemaReturnType,
} from "./types";

export class Router<TCtx extends IContext, TQuery = never, TBody = never, TData = never> {
  private readonly _handlers: Partial<Record<HttpMethodEnum, IRouteHandler>> = {};
  private _routeConfig: IRouteConfig = { fns: [] };

  /**
   * Resolve response from headers and body object
   * Log response to logger
   * @private
   */
  private _handleResponse(
    req: INextApiRequest,
    res: NextApiResponse,
    { status = HttpStatusCodeEnum.OK, headers, body = {} }: IHandlerResponse
  ): void {
    if (headers) {
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    }
    req.ctx.logger.logRequest(req, { status });
    res.status(status).json(body);
  }

  /**
   * Resolve error response from errors object
   * Log error response to logger
   * @private
   */
  private _handleError(req: INextApiRequest, res: NextApiResponse, { status, errors }: IErrorProps): void {
    const responseErrors = errors.map((err) => ({ status, ...err }));

    req.ctx.logger.logRequestErrors(req, responseErrors);
    res.status(status).json({ errors: responseErrors });
  }

  /**
   * Validate request query and body against schema and assign output to the req object
   * @private
   */
  private _validateSchema(schema: IHandlerSchema, req: NextApiRequest): void {
    if (schema.query) {
      const query = schema.query.parse(req.query);
      req.query = query;
    }

    if (schema.body) {
      if (req.body === "") {
        throw new ResponseError({
          status: HttpStatusCodeEnum.BAD_REQUEST,
          code: ResponseErrorCodeEnum.NOT_FOUND_REQUEST_BODY,
          message: "Request body is not provided",
        });
      }

      const body = schema.body.parse(req.body);
      req.body = body;
    }
  }

  /**
   * Execute route middleware chain
   * @private
   */
  private async _compose(fns: IRouteConfig["fns"], req: INextApiRequest): Promise<void> {
    for (const fn of fns) {
      const ctx = await fn(req);
      req.ctx = { ...req.ctx, ...ctx };
    }
  }

  /**
   * CORS - Responds to 'OPTIONS' requests
   * @private
   */
  private readonly _cors =
    ({ origins, methods, maxAge, credentials }: ICorsConfig) =>
    (req: INextApiRequest, res: NextApiResponse): void => {
      const origin = origins === "*" || origins?.includes(req.headers.origin ?? "") ? req.headers.origin : undefined;

      const attrs = [
        origin && ["Access-Control-Allow-Origin", origin],
        methods && ["Access-Control-Allow-Methods", methods.join(", ")],
        credentials !== undefined && ["Access-Control-Allow-Credentials", `${credentials}`],
        maxAge && ["Access-Control-Max-Age", maxAge],
        [
          "Access-Control-Allow-Headers",
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Credentials",
        ],
      ].filter(Boolean) as Array<[string, number | string]>;

      attrs.forEach(([k, v]) => res.setHeader(k, v));

      if (req.method === HttpMethodEnum.OPTIONS) {
        res.status(HttpStatusCodeEnum.NO_CONTENT).end();
      }
    };

  /**
   * Add a handler to the router map with its method as key
   * Reset `_routeConfig` to ensure all the side effects are unique to the request method
   * @private
   */
  private _add(method: string, handler: THandler<TCtx, TQuery, TBody, TData>): void {
    this._handlers[method] = { handler, ...this._routeConfig };
    this._routeConfig = { fns: [] };
  }

  /**
   * Add auth middleware to middleware chain add access token context to the request object
   */
  public auth(): Router<IAuthContext & TCtx, TQuery, TBody, TData> {
    this._routeConfig.fns.unshift((req) => {
      if (req.headers.authorization) {
        const user = verifyJwt<IAccessTokenPayload>(req.headers.authorization, TokenTypeEnum.ACCESS_TOKEN);
        return { user };
      }
      const user = verifyAuthCookie<IAccessTokenPayload>(req.cookies, TokenTypeEnum.ACCESS_TOKEN);
      return { user };
    });
    return this as unknown as Router<IAuthContext & TCtx, TQuery, TBody, TData>;
  }

  /**
   * Add middleware chain to route config
   * @param fns
   */
  public use<TFns extends Array<TMiddleware>>(
    ...fns: TFns
  ): Router<TCtx & TIntersectTupleReturn<TFns>, TQuery, TBody, TData> {
    this._routeConfig.fns.push(...fns);
    return this as unknown as Router<TCtx & TIntersectTupleReturn<TFns>, TQuery, TBody, TData>;
  }

  /**
   * Add schema to route config
   * @param schema
   */
  public schema<TQuerySchema extends ZodTypeAny, TBodySchema extends ZodTypeAny, TDataSchema extends ZodTypeAny>(
    schema: IHandlerSchema<TQuerySchema, TBodySchema, TDataSchema>
  ): Router<TCtx, TSchemaReturnType<TQuerySchema>, TSchemaReturnType<TBodySchema>, TSchemaReturnType<TDataSchema>> {
    this._routeConfig.schema = schema;
    return this as Router<
      TCtx,
      TSchemaReturnType<TQuerySchema>,
      TSchemaReturnType<TBodySchema>,
      TSchemaReturnType<TDataSchema>
    >;
  }

  public get = (handler: THandler<TCtx, TQuery, TBody, TData>): void => this._add(HttpMethodEnum.GET, handler);
  public post = (handler: THandler<TCtx, TQuery, TBody, TData>): void => this._add(HttpMethodEnum.POST, handler);
  public put = (handler: THandler<TCtx, TQuery, TBody, TData>): void => this._add(HttpMethodEnum.PUT, handler);
  public patch = (handler: THandler<TCtx, TQuery, TBody, TData>): void => this._add(HttpMethodEnum.PATCH, handler);
  public delete = (handler: THandler<TCtx, TQuery, TBody, TData>): void => this._add(HttpMethodEnum.DELETE, handler);

  public handler =
    (): TApiHandler =>
    async (req: INextApiRequest, res: NextApiResponse): Promise<void> => {
      try {
        req.ctx = { prisma, redis, logger: new ApiLogger(`${req.url} [${req.method}] <${createKey()}>`, logtail) };

        // CORS
        this._cors(CONFIG.API.CORS)(req, res);
        if (res.headersSent) {
          return;
        }

        // Return openapi schema for a given path
        if (req.headers["user-agent"] === CONFIG.API.OPENAPI.USER_AGENT) {
          const openApiJson = parseOpenApiPathItem(this._handlers, req.url);
          res.status(200).json(openApiJson);
          return;
        }

        const method = (req.method as HttpMethodEnum | undefined) ?? HttpMethodEnum.GET;
        const { handler, fns, schema } = this._handlers[method] ?? {};
        if (!handler) {
          throw new ResponseError({
            status: HttpStatusCodeEnum.NOT_ALLOWED,
            code: ResponseErrorCodeEnum.METHOD_NOT_ALLOWED,
            message: `${req.method} method is not allowed on ${req.url}`,
          });
        }

        if (schema) {
          this._validateSchema(schema, req);
        }

        if (fns) {
          await this._compose(fns, req);
        }

        const response = await handler(req, res);
        this._handleResponse(req, res, response);
      } catch (err) {
        if (err instanceof ResponseError) {
          this._handleError(req, res, { status: err.error.status, errors: [err.error] });
          return;
        }

        if (err instanceof ZodError) {
          this._handleError(req, res, {
            status: HttpStatusCodeEnum.BAD_REQUEST,
            errors: [
              {
                code: ResponseErrorCodeEnum.VALIDATION_ERROR,
                message: "Field validation error",
                causes: err.errors.map(({ path, message }) => ({
                  field: path[0]?.toString(),
                  reason: message as ValidatorReasonEnum,
                })),
              },
            ],
          });
          return;
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
          this._handleError(req, res, {
            status: HttpStatusCodeEnum.NOT_FOUND,
            errors: [{ code: ResponseErrorCodeEnum.NOT_FOUND_ERROR, message: err.message }],
          });
          return;
        }

        const status = HttpStatusCodeEnum.INTERNAL_SERVER_ERROR;
        const errors = [
          {
            status,
            code: ResponseErrorCodeEnum.INTERNAL_ERROR,
            message: "We are experiencing difficulties right now, please try again later",
          },
        ];

        req.ctx.logger.logInternalErrors(req, { message: (err as Error).message, stack: (err as Error).stack });
        res.status(status).json({ errors });
      }
    };
}
