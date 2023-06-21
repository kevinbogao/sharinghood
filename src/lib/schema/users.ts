import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { object, string } from "zod";

import { userModel } from "../db/models";
import { communityIdSchema, cuidSchema } from ".";
import { createCommunityBodySchema } from "./communities";

export const createUserQuerySchema = object({ community_id: cuidSchema.optional() });
export type TCreateUseQuery = z.infer<typeof createUserQuerySchema>;

export const createUserBodySchema = userModel.pick({ name: true, description: true, email: true, password: true });
export type TCreateUserBody = z.infer<typeof createUserBodySchema>;

export const createUserWithCommunityBodySchema = createUserBodySchema.extend({
  community_input: createCommunityBodySchema.optional(),
});
export type TCreateUserWithCommunityBody = z.infer<typeof createUserWithCommunityBodySchema>;

export const getUsersQuerySchema = communityIdSchema;
export type TGetUsersQuery = z.infer<typeof getUsersQuerySchema>;

const userFields = { id: true, name: true, description: true, apartment: true, image_url: true } as const;
export const userSelect = Prisma.validator<Prisma.UserSelect>()(userFields);
export const userSchema = userModel.pick(userFields);

const meFields = { ...userFields, email: true, is_notified: true } as const;
export const meSelect = Prisma.validator<Prisma.UserSelect>()(meFields);
export const meSchema = userModel.pick(meFields);

export const updateMeBodySchema = userModel
  .pick({ name: true, description: true, apartment: true, is_notified: true })
  .extend({
    image: string().nullish(),
  });
export type TUpdateMeBody = z.infer<typeof updateMeBodySchema>;

export const unsubscribeUserQuerySchema = object({ id: cuidSchema, token: string() });
export type TUnsubscribeUserQuerySchema = z.infer<typeof unsubscribeUserQuerySchema>;
