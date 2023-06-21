import type { z } from "zod";
import { number, object } from "zod";

import { Router } from "../../../lib/http/Router";
import { communitySchema, communitySelect, createCommunityBodySchema } from "../../../lib/schema/communities";

const router = new Router();

const getResponse = object({ communities: communitySchema.extend({ notification_count: number().min(0) }).array() });
export type TGetCommunitiesResponse = z.infer<typeof getResponse>;

router
  .schema({ response: getResponse, summary: "Get User Communities" })
  .auth()
  .get(async (req) => {
    const {
      ctx: {
        prisma,
        redis,
        logger,
        user: { user_id },
      },
    } = req;

    const communities = await prisma.community.findMany({
      where: { users: { some: { user_id } } },
      select: communitySelect,
    });

    const communityIds = communities.map(({ id }) => id);

    const notificationCount = await redis
      .hmget<Record<string, number | null>>(`notifications:${user_id}`, ...communityIds)
      .catch((err) => logger.logOperationErrors(req as any, err));

    return {
      body: {
        communities: communities.map(({ id, ...rest }) => ({
          ...rest,
          id,
          notification_count: notificationCount?.[id] ?? 0,
        })),
      },
    };
  });

const createResponse = object({ community: communitySchema });
export type TCreateCommunityResponse = z.infer<typeof createResponse>;

router
  .auth()
  .schema({ body: createCommunityBodySchema, response: createResponse, summary: "Create Community" })
  .post(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      body,
    }) => {
      const community = await prisma.community.create({
        data: { ...body, creator_id: user_id, users: { create: [{ user: { connect: { id: user_id } } }] } },
      });

      return {
        body: { community },
      };
    }
  );

export default router.handler();
