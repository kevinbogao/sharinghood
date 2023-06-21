import { Prisma } from "@prisma/client";
import type { z } from "zod";

import { communityModel } from "../db/models";

export const searchCommunityQuerySchema = communityModel.pick({ code: true });
export type TSearchCommunityQuery = z.infer<typeof searchCommunityQuerySchema>;

export const createCommunityBodySchema = communityModel.pick({ name: true, code: true, zip_code: true });
export type TCreateCommunityBody = z.infer<typeof createCommunityBodySchema>;

const communityFields = { id: true, name: true, code: true, zip_code: true } as const;

export const communitySelect = Prisma.validator<Prisma.CommunitySelect>()(communityFields);
export const communitySchema = communityModel.pick(communityFields);
