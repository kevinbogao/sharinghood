import { baseQuerySchema } from "../../lib/schema";
import type { TGetMessagesResponse } from "../../pages/api/messages/[notification_id]";
import type { TGetNotificationResponse } from "../../pages/api/notifications/[id]";
import { useRouterQuery } from "../useRouterQuery";
import { useMessagesQuery } from "./MessageHooks";
import { useNotificationQuery } from "./NotificationsHooks";

interface IUseNotificationResult {
  isLoading: boolean;
  isSuccess: boolean;
  data: {
    notification?: TGetNotificationResponse["notification"];
    messages?: TGetMessagesResponse["messages"];
  };
}

export const useNotification = (): IUseNotificationResult => {
  const { query } = useRouterQuery(baseQuerySchema);
  const notificationQuery = useNotificationQuery(query?.id as string, { enabled: Boolean(query?.id) });
  const messagesQuery = useMessagesQuery(query?.id as string, { enabled: Boolean(query?.id) });

  return {
    isLoading: notificationQuery.isLoading || messagesQuery.isLoading,
    isSuccess: notificationQuery.isSuccess || messagesQuery.isSuccess,
    data: { ...notificationQuery.data, ...messagesQuery.data },
  };
};
