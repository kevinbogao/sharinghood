import type { z } from "zod";
import { object } from "zod";

import { Router } from "../../../lib/http/Router";
import { unsubscribeUserQuerySchema, userSchema } from "../../../lib/schema/users";
import { generateUnsubscribeToken } from "../../../lib/utils/string";

const router = new Router();

const response = object({ users: userSchema.array() });
export type TGetUsersResponse = z.infer<typeof response>;

router
  .schema({
    query: unsubscribeUserQuerySchema,
    summary: "Unsubscribe User Email",
  })
  .post(async ({ ctx: { prisma }, query: { id, token } }) => {
    const user = await prisma.user.findFirstOrThrow({ where: { id, unsubscribe_token: token } });

    await prisma.user.update({
      where: { id: user.id },
      data: { is_notified: false, unsubscribe_token: generateUnsubscribeToken() },
    });

    return {};
  });

export default router.handler();
