import { compare } from "bcrypt";

import { generateAuthCookies } from "../../../lib/auth/cookie";
import { ResponseErrorCodeEnum } from "../../../lib/http/enums";
import { AuthenticationError } from "../../../lib/http/errors";
import { Router } from "../../../lib/http/Router";
import { loginBodySchema } from "../../../lib/schema/auth";

const router = new Router();

router
  .schema({ body: loginBodySchema, summary: "User Login" })
  .post(async ({ ctx: { prisma }, body: { email, password } }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthenticationError("Invalid credentials", {
        code: ResponseErrorCodeEnum.INVALID_CREDENTIALS,
      });
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError("Invalid credentials", {
        code: ResponseErrorCodeEnum.INVALID_CREDENTIALS,
      });
    }

    const authCookies = generateAuthCookies(user);
    await prisma.user.update({ where: { id: user.id }, data: { last_login: new Date() } });

    return {
      headers: { "Set-Cookie": authCookies },
    };
  });

export default router.handler();
