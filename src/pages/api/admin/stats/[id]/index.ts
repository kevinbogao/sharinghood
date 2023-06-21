import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { number, object } from "zod";

import { communityModel } from "../../../../../lib/db/models";
import { admin } from "../../../../../lib/http/middleware";
import { Router } from "../../../../../lib/http/Router";
import { adminStatsQuery } from "../../../../../lib/schema/admin";

const router = new Router();

const communityFields = { id: true, name: true, code: true, zip_code: true } as const;
const communitySelect = Prisma.validator<Prisma.CommunitySelect>()(communityFields);
const communitySchema = communityModel.pick(communityFields);

const response = object({ community: communitySchema }).extend({
  users_count: number(),
  posts_count: number(),
  requests_count: number(),
  bookings_count: number(),
});
export type TGetCommunityStatsResponse = z.infer<typeof response>;

router
  .schema({
    query: adminStatsQuery,
    response,
    summary: "Get Community Stats",
  })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const { _count, ...community } = await prisma.community.findFirstOrThrow({
      where: { id },
      select: { _count: { select: { requests: true, bookings: true, posts: true, users: true } }, ...communitySelect },
    });

    return {
      body: {
        community,
        users_count: _count.users,
        posts_count: _count.posts,
        requests_count: _count.requests,
        bookings_count: _count.bookings,
      },
    };
  });
export default router.handler();
