import type { z } from "zod";
import { number, object } from "zod";

import { admin } from "../../../../lib/http/middleware";
import { Router } from "../../../../lib/http/Router";

const router = new Router();

const getResponse = object({
  communities_count: number(),
  users_count: number(),
  posts_count: number(),
  requests_count: number(),
  bookings_count: number(),
});
export type TGetAdminStatsResponse = z.infer<typeof getResponse>;

router
  .schema({ response: getResponse, summary: "Get Stats" })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma } }) => {
    const [communities_count, users_count, posts_count, requests_count, bookings_count] = await Promise.all([
      prisma.community.count(),
      prisma.user.count(),
      prisma.post.count(),
      prisma.request.count(),
      prisma.booking.count(),
    ]);

    return {
      body: {
        communities_count,
        users_count,
        posts_count,
        requests_count,
        bookings_count,
      },
    };
  });

export default router.handler();
