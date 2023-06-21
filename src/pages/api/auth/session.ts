import type { z } from "zod";
import { boolean, object } from "zod";

import { CONFIG } from "../../../lib/Config";
import { Router } from "../../../lib/http/Router";
import { userSchema, userSelect } from "../../../lib/schema/users";

const router = new Router();

const response = object({ user: userSchema.extend({ is_admin: boolean().optional() }).nullable() });
export type TGetSessionResponse = z.infer<typeof response>;

router
  .schema({ response, summary: "User Session" })
  .auth()
  .get(
    async ({
      ctx: {
        user: { user_id },
        prisma,
      },
    }) => {
      const user = await prisma.user.findUnique({ where: { id: user_id }, select: { ...userSelect, email: true } });
      if (!user) {
        return { body: { user: null } };
      }

      if (CONFIG.API.AUTH.ADMIN_IDS.includes(user.id)) {
        return { body: { user: { ...user, is_admin: true } } };
      }

      return { body: { user } };
    }
  );

export default router.handler();
