import type { z } from "zod";
import { object } from "zod";

import { messageModel } from "../../../lib/db/models";
import { MessageTaskTypeEnum } from "../../../lib/event/enums";
import { publishMessage } from "../../../lib/event/pubsub";
import { ResponseErrorCodeEnum } from "../../../lib/http/enums";
import { ForbiddenError } from "../../../lib/http/errors";
import { Router } from "../../../lib/http/Router";
import { createMessageBodySchema } from "../../../lib/schema/messages";
import { incrementNotificationCount } from "../../../lib/utils/notifications";

const router = new Router();

const response = object({ message: messageModel });
export type TCreateMessageResponse = z.infer<typeof response>;

router
  .schema({ summary: "Create Message", body: createMessageBodySchema, response })
  .auth()
  .post(
    async ({
      ctx: {
        redis,
        prisma,
        user: { user_id },
      },
      body,
    }) => {
      const notification = await prisma.notification.findUniqueOrThrow({ where: { id: body.notification_id } });
      if (notification.creator_id !== user_id && notification.recipient_id !== user_id) {
        throw new ForbiddenError("User may not create message on this notification", {
          code: ResponseErrorCodeEnum.FORBIDDEN_ITEM,
        });
      }

      const recipientId = notification.creator_id === user_id ? notification.recipient_id : notification.creator_id;
      const message = await prisma.message.create({ data: { ...body, creator_id: user_id } });
      await Promise.all([
        await prisma.notification.update({
          where: { id: notification.id },
          data: { notifier_id: recipientId, modified_at: new Date() },
        }),
        publishMessage(redis, { type: MessageTaskTypeEnum.CHAT_MESSAGE, payload: { message } }),
        incrementNotificationCount(redis, recipientId, notification.community_id),
      ]);

      return { body: { message } };
    }
  );

export default router.handler();
