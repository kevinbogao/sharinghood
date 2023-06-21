import type { z } from "zod";
import { object } from "zod";

import { ResponseErrorCodeEnum } from "../../../../lib/http/enums";
import { ForbiddenError } from "../../../../lib/http/errors";
import { Router } from "../../../../lib/http/Router";
import { baseQuerySchema } from "../../../../lib/schema";
import { postSchema, postSelect, updatePostBodySchema } from "../../../../lib/schema/posts";
import { destroyImage, uploadImage } from "../../../../lib/utils/cloudinary";

const router = new Router();

const response = object({ post: postSchema });
export type TGetPostResponse = z.infer<typeof response>;

router
  .schema({ query: baseQuerySchema, response, summary: "Get Post" })
  .auth()
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const post = await prisma.post.findUniqueOrThrow({ where: { id }, select: postSelect });

    return { body: { post } };
  });

const updateResponse = object({ post: postSchema });
export type TUpdatePostResponse = z.infer<typeof updateResponse>;

router
  .schema({ query: baseQuerySchema, body: updatePostBodySchema, response, summary: "Update Post" })
  .auth()
  .put(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      query: { id },
      body: { image, ...body },
    }) => {
      const post = await prisma.post.findUniqueOrThrow({ where: { id } });
      if (post.creator_id !== user_id) {
        throw new ForbiddenError("User may not edit this post", {
          code: ResponseErrorCodeEnum.FORBIDDEN_ITEM,
        });
      }

      const imageUrl = image ? await uploadImage(image) : undefined;

      try {
        const updatedPost = await prisma.post.update({
          where: { id },
          data: { ...body, ...(imageUrl && { image_url: imageUrl }) },
          select: postSelect,
        });

        return { body: { post: updatedPost } };
      } catch (err) {
        if (imageUrl) {
          await destroyImage(imageUrl);
        }
        throw err;
      }
    }
  );

export default router.handler();
