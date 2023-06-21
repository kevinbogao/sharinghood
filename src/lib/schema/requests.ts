import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { string } from "zod";

import { requestModel } from "../db/models";
import { basePaginationQuerySchema, communityIdSchema } from ".";

export const createRequestBodySchema = requestModel
  .pick({
    title: true,
    description: true,
    time_frame: true,
    community_id: true,
  })
  .extend({
    image: string().min(1, "Item image is required"),
    date_need: string().datetime().optional(),
    date_return: string().datetime().optional(),
  });
export type TCreateRequestBody = z.infer<typeof createRequestBodySchema>;

export const getRequestsQuerySchema = communityIdSchema.merge(basePaginationQuerySchema);
export type TGetRequestsQuery = z.infer<typeof getRequestsQuerySchema>;

const requestFields = {
  id: true,
  title: true,
  description: true,
  image_url: true,
  creator_id: true,
  time_frame: true,
  date_need: true,
  date_return: true,
  community_id: true,
  created_at: true,
} as const;

export const requestSelect = Prisma.validator<Prisma.RequestSelect>()(requestFields);
export const requestSchema = requestModel.pick(requestFields);
export type TRequest = z.infer<typeof requestSchema>;
