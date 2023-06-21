import type { z } from "zod";
import { object } from "zod";

import { notificationModel } from "../../../../lib/db/models";
import { Router } from "../../../../lib/http/Router";
import { baseQuerySchema } from "../../../../lib/schema";

const router = new Router();

const response = object({ notification: notificationModel });
export type TGetNotificationResponse = z.infer<typeof response>;

router
  .schema({ summary: "Get Notification", response, query: baseQuerySchema })
  .auth()
  .get(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      query: { id },
    }) => {
      const notification = await prisma.notification.findFirstOrThrow({
        where: { id, OR: [{ creator_id: user_id }, { recipient_id: user_id }] },
      });

      if (user_id === notification.notifier_id) {
        await prisma.notification.update({ where: { id }, data: { notifier_id: null } });
      }

      return { body: { notification } };
    }
  );

export default router.handler();
