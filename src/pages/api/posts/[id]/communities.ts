import type { z } from "zod";
import { object } from "zod";

import { member, postOwner } from "../../../../lib/http/middleware";
import { Router } from "../../../../lib/http/Router";
import { baseQuerySchema } from "../../../../lib/schema";
import { communitySchema, communitySelect } from "../../../../lib/schema/communities";
import { addPostToCommunityBodySchema } from "../../../../lib/schema/posts";

const router = new Router();

const response = object({ communities: communitySchema.array() });
export type TGetPostCommunitiesResponse = z.infer<typeof response>;

router
  .schema({ summary: "Post Communities", query: baseQuerySchema, response })
  .auth()
  .use(postOwner)
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const communities = await prisma.community.findMany({
      where: { posts: { some: { post_id: id } } },
      select: communitySelect,
    });

    return { body: { communities } };
  });

export const addPostToCommunityResponse = object({ community: communitySchema });
export type TAddPostToCommunityResponse = z.infer<typeof addPostToCommunityResponse>;

router
  .schema({
    summary: "Add Post to Community",
    query: baseQuerySchema,
    body: addPostToCommunityBodySchema,
    response: addPostToCommunityResponse,
  })
  .auth()
  .use(member, postOwner)
  .put(async ({ ctx: { prisma, post }, body: { community_id } }) => {
    await prisma.postsOnCommunities.create({ data: { community_id, post_id: post.id } });
    const community = await prisma.community.findFirstOrThrow({ where: { id: community_id } });

    return { body: { community } };
  });

export default router.handler();
