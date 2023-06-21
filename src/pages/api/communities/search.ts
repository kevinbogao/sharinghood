import type { z } from "zod";
import { object } from "zod";

import { Router } from "../../../lib/http/Router";
import { communitySchema, communitySelect, searchCommunityQuerySchema } from "../../../lib/schema/communities";

const router = new Router();

const response = object({ community: communitySchema });
export type TSearchCommunityResponse = z.infer<typeof response>;

router
  .schema({ query: searchCommunityQuerySchema, response, summary: "Search Community" })
  .get(async ({ ctx: { prisma }, query: { code } }) => {
    const community = await prisma.community.findUniqueOrThrow({ where: { code }, select: communitySelect });

    return {
      body: { community },
    };
  });

export default router.handler();
