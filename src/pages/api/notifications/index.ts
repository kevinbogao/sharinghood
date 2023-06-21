import { NotificationTypeEnum } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { notificationModel } from "../../../lib/db/models";
import { Router } from "../../../lib/http/Router";
import {
  createChatNotificationBodySchema,
  getNotificationsQuerySchema,
  notificationSchema,
} from "../../../lib/schema/notifications";

const router = new Router();

const response = object({ notifications: notificationSchema.array() });
export type TGetNotificationsResponse = z.infer<typeof response>;

router
  .schema({
    summary: "Get Notifications",
    query: getNotificationsQuerySchema,
    response,
  })
  .auth()
  .get(
    async ({
      ctx: {
        redis,
        prisma,
        user: { user_id },
      },
      query: { community_id },
    }) => {
      const notifications = await prisma.notification.findMany({
        where: { OR: [{ creator_id: user_id }, { recipient_id: user_id }] },
        select: {
          id: true,
          type: true,
          creator_id: true,
          community_id: true,
          updated_at: true,
          recipient_id: true,
          notifier_id: true,
          booking: {
            select: {
              id: true,
              status: true,
              time_frame: true,
              date_need: true,
              date_return: true,
              post: { select: { id: true, title: true, creator_id: true, image_url: true } },
            },
          },
          post: { select: { id: true, title: true, creator_id: true, image_url: true } },
        },
        orderBy: { modified_at: "desc" },
      });

      await redis.hdel(`notifications:${user_id}`, community_id);

      return { body: { notifications } };
    }
  );

const creatChatNotificationResponse = object({ notification: notificationModel });
export type TCreatChatNotificationResponse = z.infer<typeof creatChatNotificationResponse>;

router
  .schema({
    summary: "Create Chat Notification",
    body: createChatNotificationBodySchema,
    response: creatChatNotificationResponse,
  })
  .auth()
  .post(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      body: { recipient_id, community_id },
    }) => {
      const notification = await prisma.notification.findFirst({
        where: {
          type: NotificationTypeEnum.CHAT,
          community_id,
          OR: [
            { creator_id: user_id, recipient_id },
            { creator_id: recipient_id, recipient_id: user_id },
          ],
        },
      });

      if (notification) {
        return { body: { notification } };
      }

      const newNotification = await prisma.notification.create({
        data: {
          type: NotificationTypeEnum.CHAT,
          creator_id: user_id,
          recipient_id,
          community_id,
        },
      });
      return { body: { notification: newNotification } };
    }
  );

export default router.handler();
