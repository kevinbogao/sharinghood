import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { string } from "zod";

import { threadModel } from "../db/models";

export const createThreadBodySchema = threadModel.pick({ content: true, community_id: true }).extend({
  post_id: string().cuid().optional(),
  request_id: string().cuid().optional(),
});
export type TCreateThreadBody = z.infer<typeof createThreadBodySchema>;

const threadFields = {
  id: true,
  content: true,
  post_id: true,
  request_id: true,
  creator_id: true,
  community_id: true,
  created_at: true,
} as const;

export const threadSelect = Prisma.validator<Prisma.ThreadSelect>()(threadFields);
export const threadSchema = threadModel.pick(threadFields);
