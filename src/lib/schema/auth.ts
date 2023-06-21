import type { z } from "zod";
import { object, string } from "zod";

import { userModel } from "../db/models";

export const loginBodySchema = userModel.pick({ email: true, password: true });
export type TLoginBody = z.infer<typeof loginBodySchema>;

export const resetPasswordCodeQuerySchema = object({ code: string() });
export type TResetPasswordCodeQuery = z.infer<typeof resetPasswordCodeQuerySchema>;

export const resetPasswordBodySchema = userModel.pick({ email: true });
export type TResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const setPasswordBodySchema = userModel.pick({ password: true }).extend({ code: string() });
export type TSetPasswordBody = z.infer<typeof setPasswordBodySchema>;
