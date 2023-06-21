import type { z } from "zod";
import { object } from "zod";

import { messageModel } from "../../../lib/db/models";
import { ResponseErrorCodeEnum } from "../../../lib/http/enums";
import { ForbiddenError } from "../../../lib/http/errors";
import { Router } from "../../../lib/http/Router";
import { getMessagesQuerySchema } from "../../../lib/schema/messages";

const router = new Router();

const response = object({ messages: messageModel.array() });
export type TGetMessagesResponse = z.infer<typeof response>;

router
  .schema({ summary: "Create Message", query: getMessagesQuerySchema, response })
  .auth()
  .get(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      query: { notification_id },
    }) => {
      const notification = await prisma.notification.findUniqueOrThrow({ where: { id: notification_id } });
      if (notification.creator_id !== user_id && notification.recipient_id !== user_id) {
        throw new ForbiddenError("User get messages on this notification", {
          code: ResponseErrorCodeEnum.FORBIDDEN_ITEM,
        });
      }

      const messages = await prisma.message.findMany({ where: { notification_id } });
      return { body: { messages } };
    }
  );

export default router.handler();
