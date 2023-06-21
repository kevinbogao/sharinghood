import type { z } from "zod";
import { object } from "zod";

import { member } from "../../../lib/http/middleware";
import { Router } from "../../../lib/http/Router";
import { getUsersQuerySchema, userSchema, userSelect } from "../../../lib/schema/users";

const router = new Router();

const response = object({ users: userSchema.array() });
export type TGetUsersResponse = z.infer<typeof response>;

router
  .schema({
    query: getUsersQuerySchema,
    response,
    summary: "Get Members",
  })
  .auth()
  .use(member)
  .get(async ({ ctx: { prisma }, query: { community_id } }) => {
    const members = await prisma.user.findMany({
      where: { communities: { some: { community_id } } },
      select: userSelect,
    });

    return {
      body: { users: members },
    };
  });

export default router.handler();
