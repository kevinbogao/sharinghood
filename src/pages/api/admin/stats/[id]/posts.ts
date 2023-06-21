import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { postModel } from "../../../../../lib/db/models";
import { admin } from "../../../../../lib/http/middleware";
import { Router } from "../../../../../lib/http/Router";
import { adminStatsQuery } from "../../../../../lib/schema/admin";

const router = new Router();

const postFields = {
  id: true,
  title: true,
  condition: true,
  image_url: true,
  is_giveaway: true,
  creator_id: true,
  created_at: true,
} as const;
const postSelect = Prisma.validator<Prisma.PostSelect>()(postFields);
const postSchema = postModel.pick(postFields);

const response = object({ posts: postSchema.array() });
export type TGetCommunityPostsResponse = z.infer<typeof response>;

router
  .schema({
    query: adminStatsQuery,
    response,
    summary: "Get Community Posts",
  })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const posts = await prisma.post.findMany({
      where: { communities: { some: { community_id: id } } },
      select: postSelect,
    });

    return {
      body: { posts },
    };
  });

export default router.handler();
