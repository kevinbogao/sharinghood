import type { z } from "zod";
import { boolean, number, object, preprocess, string } from "zod";

import { CONFIG } from "../Config";
import { ValidatorReasonEnum } from "./enums";

export const cuidSchema = string({ required_error: ValidatorReasonEnum.FIELD_VALUE_REQUIRED }).cuid2({
  message: ValidatorReasonEnum.INVALID_CUID_TYPE,
});

export const communityIdSchema = object({ community_id: cuidSchema });
export type TCommunityIdSchema = z.infer<typeof communityIdSchema>;

export const basePaginationQuerySchema = object({
  skip: preprocess((num) => Number(num ?? CONFIG.API.PAGINATION.DEFAULT_SKIP), number().int()),
  take: preprocess((num) => Number(num ?? CONFIG.API.PAGINATION.DEFAULT_TAKE), number().int().min(1).max(100)),
});

export const basePaginationResultSchema = object({ has_more: boolean(), total_count: number().int() });

export const baseQuerySchema = object({ id: cuidSchema });
export type TBaseQuerySchema = z.infer<typeof baseQuerySchema>;
