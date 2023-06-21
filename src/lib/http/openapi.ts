import { generateSchema } from "@anatine/zod-openapi";
import type { OpenAPIObject, PathsObject } from "openapi3-ts";
import type { ZodTypeAny } from "zod";
import { nativeEnum, number, object, string } from "zod";

import { CONFIG, RuntimeEnvironmentEnum } from "../Config";
import { ValidatorReasonEnum } from "../schema/enums";
import { getAllFilesFromDir } from "../utils/file";
import { capitalise } from "../utils/string";
import type { HttpMethodEnum } from "./enums";
import { ResponseErrorCodeEnum } from "./enums";
import type { IRouteHandler } from "./types";

const API_ROUTES_PATH =
  CONFIG.SERVER.RUNTIME_ENVIRONMENT === RuntimeEnvironmentEnum.LOCAL ? "src/pages/api" : ".next/server/pages/api";
const API_ROUTE_FILE_EXTENSION = CONFIG.SERVER.RUNTIME_ENVIRONMENT === RuntimeEnvironmentEnum.LOCAL ? ".ts" : ".js";

const ERROR_SCHEMA = object({
  errors: object({
    status: number(),
    code: nativeEnum(ResponseErrorCodeEnum),
    message: string(),
    causes: object({
      field: string().optional(),
      reason: nativeEnum(ValidatorReasonEnum).optional(),
    })
      .array()
      .optional(),
  }).array(),
});

export function getApiRoutes(): Array<string> {
  return getAllFilesFromDir(`./${API_ROUTES_PATH}`)
    .filter((file) => file !== `${API_ROUTES_PATH}${CONFIG.API.OPENAPI.API_PATH}${API_ROUTE_FILE_EXTENSION}`)
    .map((file) =>
      file
        .replace(`${API_ROUTES_PATH}`, "")
        .replace("/index", "")
        .replace("[", "{")
        .replace("]", "}")
        .replace(API_ROUTE_FILE_EXTENSION, "")
    );
}

function parseParameters(schema?: ZodTypeAny): Array<object> | undefined {
  if (!schema) {
    return;
  }
  const querySchema = generateSchema(schema);
  if (!querySchema.properties) {
    return;
  }

  return Object.entries(querySchema.properties).map(([name, _schema]) => ({
    name,
    in: "path",
    schema: _schema,
    required: querySchema.required?.includes(name),
  }));
}

export function parseOpenApiPathItem(
  handlers: Partial<Record<HttpMethodEnum, IRouteHandler>>,
  reqUrl = ""
): PathsObject {
  return Object.entries(handlers).reduce<PathsObject>((pathItem, [_method, handler]) => {
    const method = _method.toLowerCase();
    if (handler.schema?.query) {
      const parameters = parseParameters(handler.schema.query);
      pathItem[method] = {
        ...pathItem[method],
        ...(parameters && { parameters }),
      };
    }

    if (handler.schema?.body) {
      pathItem[method] = {
        ...pathItem[method],
        requestBody: { content: { "application/json": { schema: generateSchema(handler.schema.body) } } },
      };
    }

    const successResponse = handler.schema?.response
      ? { content: { "application/json": { schema: generateSchema(handler.schema.response) } } }
      : {};

    pathItem[method] = {
      ...pathItem[method],
      summary: handler.schema?.summary,
      responses: {
        200: successResponse,
        default: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
      tags: [`${capitalise(reqUrl.split("/")[2] ?? "")}`],
    };

    return pathItem;
  }, {});
}

export function generateOpenApiSchema(paths: Record<string, PathsObject>): OpenAPIObject {
  const sortedPaths = Object.keys(paths)
    .sort()
    .reduce((obj, key) => {
      obj[key] = paths[key];
      return obj;
    }, {});

  return {
    openapi: "3.0.1",
    info: CONFIG.API.OPENAPI.info,
    components: {
      schemas: {
        Error: generateSchema(ERROR_SCHEMA),
      },
    },
    paths: sortedPaths,
  };
}
