import type { z } from "zod";
import { number, object } from "zod";

import { admin } from "../../../../lib/http/middleware";
import { Router } from "../../../../lib/http/Router";
import { communitySchema, communitySelect } from "../../../../lib/schema/communities";

const router = new Router();

const getResponse = object({
  communities: communitySchema
    .extend({
      users_count: number(),
      posts_count: number(),
      requests_count: number(),
      bookings_count: number(),
    })
    .array(),
});
export type TGetAdminCommunitiesResponse = z.infer<typeof getResponse>;

router
  .schema({ response: getResponse, summary: "Get Communities" })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma } }) => {
    const communities = await prisma.community.findMany({
      select: { _count: { select: { requests: true, bookings: true, posts: true, users: true } }, ...communitySelect },
    });
    return {
      body: {
        communities: communities.map(({ _count: { users, posts, requests, bookings }, ...community }) => ({
          ...community,
          users_count: users,
          posts_count: posts,
          requests_count: requests,
          bookings_count: bookings,
        })),
      },
    };
  });

export default router.handler();
