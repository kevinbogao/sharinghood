import { TokenTypeEnum } from "../../../lib/auth/enums";
import { removeCookies } from "../../../lib/http/cookie";
import { Router } from "../../../lib/http/Router";

const router = new Router();

router.schema({ summary: "User Logout" }).post(() => {
  const cookiesToRemove = removeCookies(TokenTypeEnum.ACCESS_TOKEN, TokenTypeEnum.REFRESH_TOKEN);

  return {
    headers: { "Set-Cookie": cookiesToRemove },
  };
});

export default router.handler();
