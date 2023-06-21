import type { z } from "zod";
import { object, string } from "zod";

import { HttpStatusCodeEnum, ResponseErrorCodeEnum } from "../../../lib/http/enums";
import { ResponseError } from "../../../lib/http/errors";
import { member } from "../../../lib/http/middleware";
import { Router } from "../../../lib/http/Router";
import { basePaginationQuerySchema, basePaginationResultSchema } from "../../../lib/schema";
import { createThreadBodySchema, threadSchema, threadSelect } from "../../../lib/schema/threads";

const router = new Router();

const querySchema = object({
  post_id: string().cuid().optional(),
  request_id: string().cuid().optional(),
  community_id: string().cuid(),
}).merge(basePaginationQuerySchema);
export type TGetThreadsQuery = z.infer<typeof querySchema>;

const getResponse = object({ threads: threadSchema.array() }).merge(basePaginationResultSchema);
export type TGetThreadsResponse = z.infer<typeof getResponse>;

router
  .schema({ query: querySchema, response: getResponse, summary: "Get Threads" })
  .auth()
  .use(member)
  .get(async ({ ctx: { prisma }, query: { post_id, request_id, community_id, skip, take } }) => {
    if (!post_id && !request_id) {
      throw new ResponseError({
        status: HttpStatusCodeEnum.BAD_REQUEST,
        code: ResponseErrorCodeEnum.NOT_FOUND_DATE_NEED,
        message: "One of post_id and request_id is required",
      });
    }
    const [threads, count] = await Promise.all([
      prisma.thread.findMany({
        skip,
        take,
        where: { post_id, request_id, community_id },
        select: threadSelect,
        orderBy: { created_at: "desc" },
      }),
      prisma.thread.count({ where: { post_id, request_id, community_id } }),
    ]);

    return { body: { threads, has_more: skip + take < count, total_count: count } };
  });

const createResponse = object({ thread: threadSchema });
export type TCreateThreadResponse = z.infer<typeof createResponse>;

router
  .schema({ body: createThreadBodySchema, response: createResponse, summary: "Create Thread" })
  .auth()
  .use(member)
  .post(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      body,
    }) => {
      const thread = await prisma.thread.create({ data: { ...body, creator_id: user_id }, select: threadSelect });
      return { body: { thread } };
    }
  );

export default router.handler();
