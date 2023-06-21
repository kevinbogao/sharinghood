import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { bookingModel } from "../../../../../lib/db/models";
import { admin } from "../../../../../lib/http/middleware";
import { Router } from "../../../../../lib/http/Router";
import { adminStatsQuery } from "../../../../../lib/schema/admin";

const router = new Router();

const bookingFields = {
  id: true,
  post_id: true,
  booker_id: true,
  status: true,
  time_frame: true,
  date_need: true,
  date_return: true,
} as const;
const bookingSelect = Prisma.validator<Prisma.BookingSelect>()(bookingFields);
const bookingSchema = bookingModel.pick(bookingFields);

const response = object({ bookings: bookingSchema.array() });
export type TGetCommunityBookingsResponse = z.infer<typeof response>;

router
  .schema({
    query: adminStatsQuery,
    response,
    summary: "Get Community Bookings",
  })
  .auth()
  .use(admin)
  .get(async ({ ctx: { prisma }, query: { id } }) => {
    const bookings = await prisma.booking.findMany({ where: { community_id: id }, select: bookingSelect });
    return { body: { bookings } };
  });

export default router.handler();
