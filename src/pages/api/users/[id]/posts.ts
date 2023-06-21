import type { z } from "zod";
import { object, string } from "zod";

import { Router } from "../../../../lib/http/Router";
import { cuidSchema } from "../../../../lib/schema";
import { postSchema, postSelect } from "../../../../lib/schema/posts";

const router = new Router();

const getMemberPostsQuery = object({ id: cuidSchema });

const response = object({ posts: postSchema.extend({ community_ids: string().array() }).array() });
export type TGetMemberPostsResponse = z.infer<typeof response>;

router
  .schema({ query: getMemberPostsQuery, summary: "Get Member Posts", response })
  .auth()
  .get(
    async ({
      query: { id },
      ctx: {
        prisma,
        user: { user_id },
      },
    }) => {
      const userCommunities = await prisma.usersOnCommunities.findMany({
        where: { user_id },
        select: { community_id: true },
      });
      const communityIds = userCommunities.map(({ community_id }) => community_id);

      const posts = await prisma.post.findMany({
        where: { creator_id: id, communities: { some: { community_id: { in: communityIds } } } },
        select: { ...postSelect, communities: { select: { community_id: true } } },
        orderBy: { created_at: "desc" },
      });

      return {
        body: {
          posts: posts.map(({ communities, ...rest }) => ({
            ...rest,
            community_ids: communities.map(({ community_id }) => community_id),
          })),
        },
      };
    }
  );

export default router.handler();
