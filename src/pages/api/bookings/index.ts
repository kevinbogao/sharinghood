import type { Notification as NotificationModel, Prisma } from "@prisma/client";
import { BookingStatusEnum, NotificationTypeEnum, TimeFrameEnum } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { bookingModel } from "../../../lib/db/models";
import { HttpStatusCodeEnum, ResponseErrorCodeEnum } from "../../../lib/http/enums";
import { ForbiddenError, ResponseError } from "../../../lib/http/errors";
import { Router } from "../../../lib/http/Router";
import { cuidSchema } from "../../../lib/schema";
import { createBookingBodySchema } from "../../../lib/schema/bookings";
import { incrementNotificationCount } from "../../../lib/utils/notifications";

async function createBookingNotification(
  prisma: Prisma.TransactionClient,
  input: Omit<Prisma.NotificationUncheckedCreateInput, "type">
): Promise<Pick<NotificationModel, "id">> {
  return prisma.notification.create({
    data: { type: NotificationTypeEnum.BOOKING, ...input },
    select: { id: true },
  });
}

const router = new Router();

const response = object({ booking: bookingModel, notification_id: cuidSchema });
export type TCreateBookingResponse = z.infer<typeof response>;

router
  .schema({ body: createBookingBodySchema, response, summary: "Create Booking" })
  .auth()
  .post(
    async ({
      ctx: {
        prisma,
        redis,
        user: { user_id },
      },
      body: { time_frame, date_need, date_return, ...body },
    }) => {
      const post = await prisma.post.findFirstOrThrow({ where: { id: body.post_id }, select: { creator_id: true } });
      if (post.creator_id === user_id) {
        throw new ForbiddenError("User may not book their own item", {
          code: ResponseErrorCodeEnum.FORBIDDEN_ITEM,
        });
      }

      if (time_frame !== TimeFrameEnum.SPECIFIC) {
        const [booking, notification] = await prisma.$transaction(async (p) => {
          const _booking = await p.booking.create({
            data: { ...body, time_frame, status: BookingStatusEnum.PENDING, booker_id: user_id },
          });
          const _notification = await createBookingNotification(p, {
            booking_id: _booking.id,
            community_id: body.community_id,
            creator_id: user_id,
            notifier_id: post.creator_id,
            recipient_id: post.creator_id,
          });
          return [_booking, _notification];
        });

        await incrementNotificationCount(redis, post.creator_id, body.community_id);

        return { body: { booking, notification_id: notification.id } };
      }

      if (!date_need) {
        throw new ResponseError({
          status: HttpStatusCodeEnum.BAD_REQUEST,
          code: ResponseErrorCodeEnum.NOT_FOUND_DATE_NEED,
          message: "date_need is required for booking on specific data",
        });
      }

      const [booking, notification] = await prisma.$transaction(async (p) => {
        const _booking = await p.booking.create({
          data: {
            ...body,
            time_frame,
            status: BookingStatusEnum.PENDING,
            booker_id: user_id,
            date_need,
            date_return: date_return ?? date_need,
          },
        });
        const _notification = await createBookingNotification(p, {
          booking_id: _booking.id,
          community_id: body.community_id,
          creator_id: user_id,
          notifier_id: post.creator_id,
          recipient_id: post.creator_id,
        });
        return [_booking, _notification];
      });

      await incrementNotificationCount(redis, post.creator_id, body.community_id);

      return { body: { booking, notification_id: notification.id } };
    }
  );

export default router.handler();
