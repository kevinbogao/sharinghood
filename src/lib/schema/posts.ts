import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { object, string } from "zod";

import { postModel } from "../db/models";
import { basePaginationQuerySchema, communityIdSchema, cuidSchema } from ".";

export const getPostsQuerySchema = communityIdSchema.merge(basePaginationQuerySchema);
export type TGetPostsQuery = z.infer<typeof getPostsQuerySchema>;

export const updatePostBodySchema = postModel
  .pick({
    title: true,
    description: true,
    condition: true,
    is_giveaway: true,
  })
  .extend({
    image: string().nullish(),
  });
export type TUpdatePostBody = z.infer<typeof updatePostBodySchema>;

export const createPostBodySchema = updatePostBodySchema
  .merge(communityIdSchema)
  .omit({ image: true })
  .extend({
    request_id: cuidSchema.optional(),
    image: string().min(1, "Item image is required"),
  });
export type TCreatePostBody = z.infer<typeof createPostBodySchema>;

const postFields = {
  id: true,
  title: true,
  description: true,
  condition: true,
  image_url: true,
  is_giveaway: true,
  creator_id: true,
  created_at: true,
} as const;

export const postSelect = Prisma.validator<Prisma.PostSelect>()(postFields);
export const postSchema = postModel.pick(postFields);
export type TPost = z.infer<typeof postSchema>;

export const addPostToCommunityBodySchema = object({ community_id: cuidSchema });
export type TAddPostToCommunityBody = z.infer<typeof addPostToCommunityBodySchema>;
