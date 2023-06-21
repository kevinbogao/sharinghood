import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { requestModel } from "../../../../../lib/db/models";
import { admin } from "../../../../../lib/http/middleware";
import { Router } from "../../../../../lib/http/Router";
import { adminStatsQuery } from "../../../../../lib/schema/admin";

const router = new Router();

const requestFields = {
  id: true,
  title: true,
  time_frame: true,
  date_need: true,
  date_return: true,
  image_url: true,
  creator_id: true,
  created_at: true,
} as const;
const requestSelect = Prisma.validator<Prisma.RequestSelect>()(requestFields);
const requestSchema = requestModel.pick(requestFields);

const response = object({ requests: requestSchema.array() });
export type TGetCommunityRequestsResponse = z.infer<typeof response>;

router
  .schema({
    query: adminStatsQuery,
    response,
    summary: "Get Community Requests",
  })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const requests = await prisma.request.findMany({ where: { community_id: id }, select: requestSelect });
    return { body: { requests } };
  });

export default router.handler();
