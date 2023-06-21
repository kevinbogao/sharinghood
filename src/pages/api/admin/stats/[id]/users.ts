import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { userModel } from "../../../../../lib/db/models";
import { admin } from "../../../../../lib/http/middleware";
import { Router } from "../../../../../lib/http/Router";
import { adminStatsQuery } from "../../../../../lib/schema/admin";

const router = new Router();

const userFields = { id: true, name: true, email: true, image_url: true, created_at: true, last_login: true } as const;
const userSelect = Prisma.validator<Prisma.UserSelect>()(userFields);
const userSchema = userModel.pick(userFields);

const response = object({ users: userSchema.array() });
export type TGetCommunityUsersResponse = z.infer<typeof response>;

router
  .schema({
    query: adminStatsQuery,
    response,
    summary: "Get Community Users",
  })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const users = await prisma.user.findMany({
      where: { communities: { some: { community_id: id } } },
      select: userSelect,
    });

    return {
      body: { users },
    };
  });

export default router.handler();
