import type { z } from "zod";

import { bookingModel, notificationModel, postModel } from "../db/models";

export const getNotificationsQuerySchema = notificationModel.pick({ community_id: true });
export type TGetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;

export const notificationSchema = notificationModel
  .pick({
    id: true,
    type: true,
    creator_id: true,
    community_id: true,
    updated_at: true,
    recipient_id: true,
    notifier_id: true,
  })
  .extend({
    post: postModel.pick({ id: true, title: true, creator_id: true, image_url: true }).nullable(),
    booking: bookingModel
      .pick({ id: true, status: true, time_frame: true, date_need: true, date_return: true })

      .extend({ post: postModel.pick({ id: true, title: true, creator_id: true, image_url: true }) })
      .nullable(),
  });

export const createChatNotificationBodySchema = notificationModel.pick({ recipient_id: true, community_id: true });
export type TCreateChatNotificationBody = z.infer<typeof createChatNotificationBodySchema>;
