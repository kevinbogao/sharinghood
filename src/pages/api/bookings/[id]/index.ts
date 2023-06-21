import { BookingStatusEnum } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { bookingModel } from "../../../../lib/db/models";
import { ResponseErrorCodeEnum } from "../../../../lib/http/enums";
import { ForbiddenError } from "../../../../lib/http/errors";
import { Router } from "../../../../lib/http/Router";
import { cuidSchema } from "../../../../lib/schema";
import { updateBookingBodySchema, updateBookingQuerySchema } from "../../../../lib/schema/bookings";
import { incrementNotificationCount } from "../../../../lib/utils/notifications";

const router = new Router();

const response = object({ booking: bookingModel, notification_id: cuidSchema.nullish() });
export type TUpdateBookingResponse = z.infer<typeof response>;

router
  .schema({ summary: "Update Booking", query: updateBookingQuerySchema, body: updateBookingBodySchema, response })
  .auth()
  .put(
    async ({
      ctx: {
        redis,
        prisma,
        user: { user_id },
      },
      query: { id },
      body: { status },
    }) => {
      if (status === BookingStatusEnum.PENDING) {
        throw new ForbiddenError("User may not change a booking status to pending", {
          code: ResponseErrorCodeEnum.INVALIDE_BOOKING_STATUS,
        });
      }

      const booking = await prisma.booking.findFirstOrThrow({
        where: { id },
        select: {
          id: true,
          booker_id: true,
          post: { select: { creator_id: true } },
          notification: { select: { id: true } },
        },
      });

      if (booking.post.creator_id !== user_id) {
        throw new ForbiddenError("User may not update this item", {
          code: ResponseErrorCodeEnum.FORBIDDEN_ITEM,
        });
      }

      const updatedBooking = await prisma.booking.update({ where: { id }, data: { status } });

      if (booking.notification) {
        const notification = await prisma.notification.update({
          where: { id: booking.notification.id },
          data: { notifier_id: booking.booker_id, modified_at: new Date() },
        });
        await incrementNotificationCount(redis, booking.post.creator_id, notification.community_id);
      }

      return { body: { booking: updatedBooking, notification_id: booking.notification?.id } };
    }
  );

export default router.handler();
