import { hash } from "bcrypt";
import { randomBytes } from "crypto";

import { CONFIG } from "../../../../lib/Config";
import { HttpStatusCodeEnum, ResponseErrorCodeEnum } from "../../../../lib/http/enums";
import { ResponseError } from "../../../../lib/http/errors";
import { Router } from "../../../../lib/http/Router";
import {
  resetPasswordBodySchema,
  resetPasswordCodeQuerySchema,
  setPasswordBodySchema,
} from "../../../../lib/schema/auth";

const router = new Router();

router
  .schema({ summary: "Validate Reset Password Code", query: resetPasswordCodeQuerySchema })
  .get(async ({ ctx: { redis }, query: { code } }) => {
    const userId = await redis.get<string>(`reset_password:${code}`);
    if (!userId) {
      throw new ResponseError({
        status: HttpStatusCodeEnum.BAD_REQUEST,
        code: ResponseErrorCodeEnum.INVALID_RESET_CODE,
        message: "Reset password code is invalid",
      });
    }

    return {};
  });

router
  .schema({ summary: "Reset User Password", body: resetPasswordBodySchema })
  .post(async ({ ctx: { prisma, redis }, body: { email } }) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    const resetCode = randomBytes(CONFIG.API.AUTH.RESET_PASSWORD_CODE_LENGTH).toString("hex");
    await redis.set(`reset_password:${resetCode}`, user.id, {
      ex: CONFIG.API.AUTH.RESET_PASSWORD_CODE_EXPIRATION_PERIOD,
    });

    return {};
  });

router
  .schema({ summary: "Set User Password", body: setPasswordBodySchema })
  .put(async ({ ctx: { prisma, redis }, body: { code, password } }) => {
    const userId = await redis.get<string>(`reset_password:${code}`);
    if (!userId) {
      throw new ResponseError({
        status: HttpStatusCodeEnum.BAD_REQUEST,
        code: ResponseErrorCodeEnum.INVALID_RESET_CODE,
        message: "Reset password code is invalid",
      });
    }

    const passwordHash = await hash(password, CONFIG.API.AUTH.PASSWORD_HASH_SALT);
    await prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });

    await redis.del(`reset_password:${code}`);

    return {};
  });

export default router.handler();
