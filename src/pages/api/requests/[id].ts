import type { z } from "zod";
import { object } from "zod";

import { Router } from "../../../lib/http/Router";
import { baseQuerySchema } from "../../../lib/schema";
import { requestSchema, requestSelect } from "../../../lib/schema/requests";

const router = new Router();

const response = object({ request: requestSchema });
export type TGetRequestResponse = z.infer<typeof response>;

router
  .schema({ query: baseQuerySchema, response, summary: "Get Request" })
  .auth()
  .get(async ({ query: { id }, ctx: { prisma } }) => {
    const request = await prisma.request.findUniqueOrThrow({ where: { id }, select: requestSelect });

    return { body: { request } };
  });

export default router.handler();
