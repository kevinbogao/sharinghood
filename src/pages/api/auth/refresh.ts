import { generateAuthCookies, verifyAuthCookie } from "../../../lib/auth/cookie";
import { TokenTypeEnum } from "../../../lib/auth/enums";
import { Router } from "../../../lib/http/Router";

const router = new Router();

router.schema({ summary: "Refresh Access token with Refresh token" }).post(async ({ cookies, ctx: { prisma } }) => {
  const { user_id } = verifyAuthCookie(cookies, TokenTypeEnum.REFRESH_TOKEN);
  const user = await prisma.user.findFirstOrThrow({ where: { id: user_id } });
  const authCookies = generateAuthCookies(user);
  await prisma.user.update({ where: { id: user_id }, data: { last_login: new Date() } });

  return {
    headers: { "Set-Cookie": authCookies },
  };
});

export default router.handler();
