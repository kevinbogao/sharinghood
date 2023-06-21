import type { PathsObject } from "openapi3-ts";
import { any } from "zod";

import { appConfig } from "../../lib/client/appConfig";
import { CONFIG } from "../../lib/Config";
import { admin } from "../../lib/http/middleware";
import { generateOpenApiSchema, getApiRoutes } from "../../lib/http/openapi";
import { Router } from "../../lib/http/Router";
import { request } from "../../lib/utils/request";

const router = new Router();

router
  .schema({
    response: any(),
    summary: "Get openapi schema",
  })
  .auth()
  .use(admin)
  .get(async () => {
    const apiRoutes = getApiRoutes();

    const paths: Record<string, PathsObject> = {};
    await Promise.all(
      apiRoutes.map(async (path) => {
        const pathItem = await request<PathsObject>(`${appConfig.apiUrl}${path}`, {
          headers: {
            "User-Agent": CONFIG.API.OPENAPI.USER_AGENT,
          },
        });
        paths[path] = pathItem;
      })
    );

    return {
      body: generateOpenApiSchema(paths),
    };
  });

export default router.handler();
