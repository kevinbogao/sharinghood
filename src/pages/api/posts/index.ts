import { NotificationTypeEnum } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { member } from "../../../lib/http/middleware";
import { Router } from "../../../lib/http/Router";
import { basePaginationResultSchema } from "../../../lib/schema";
import { createPostBodySchema, getPostsQuerySchema, postSchema, postSelect } from "../../../lib/schema/posts";
import { destroyImage, uploadImage } from "../../../lib/utils/cloudinary";

const router = new Router();

const getResponse = object({ posts: postSchema.array() }).merge(basePaginationResultSchema);
export type TGetPostsResponse = z.infer<typeof getResponse>;

router
  .schema({ query: getPostsQuerySchema, response: getResponse, summary: "Get Posts From Community" })
  .auth()
  .use(member)
  .get(async ({ query: { community_id, skip, take }, ctx: { prisma } }) => {
    const [posts, count] = await Promise.all([
      prisma.post.findMany({
        skip,
        take,
        where: { communities: { some: { community_id } } },
        select: postSelect,
        orderBy: { created_at: "desc" },
      }),
      prisma.post.count({ where: { communities: { some: { community_id } } } }),
    ]);

    return { body: { posts, has_more: skip + take < count, total_count: count } };
  });

const createResponse = object({ post: postSchema });
export type TCreatePostResponse = z.infer<typeof createResponse>;

router
  .schema({ body: createPostBodySchema, response: createResponse, summary: "Create Post" })
  .auth()
  .use(member)
  .post(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      body: { community_id, request_id, image, ...input },
    }) => {
      const imageUrl = await uploadImage(image);

      try {
        const post = await prisma.post.create({
          data: {
            ...input,
            creator_id: user_id,
            image_url: imageUrl,
            communities: { create: [{ community: { connect: { id: community_id } } }] },
          },
          select: postSelect,
        });

        if (!request_id) {
          return { body: { post } };
        }

        const request = await prisma.request.findUnique({ where: { id: request_id } });
        if (!request) {
          return { body: { post } };
        }

        await prisma.notification.create({
          data: {
            type: NotificationTypeEnum.REQUEST,
            post_id: post.id,
            creator_id: user_id,
            recipient_id: request.creator_id,
            community_id,
          },
        });

        return { body: { post } };
      } catch (err) {
        await destroyImage(imageUrl);
        throw err;
      }
    }
  );

export default router.handler();
