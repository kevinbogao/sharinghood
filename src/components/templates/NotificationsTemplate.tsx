import Link from "next/link";
import { useRouter } from "next/router";
import type { FC, PropsWithChildren, ReactElement } from "react";
import { object } from "zod";

import { useNotificationsQuery } from "../../hooks/api/NotificationsHooks";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { useCommunityIdStore } from "../../lib/client/Store";
import { cuidSchema } from "../../lib/schema";
import type { TGetNotificationsResponse } from "../../pages/api/notifications";
import { NotificationTab } from "../NotificationTab";

export const NotificationsTemplate: FC<PropsWithChildren> = ({ children }) => {
  const communityId = useCommunityIdStore((store) => store.communityId);
  const { query } = useRouterQuery(object({ id: cuidSchema.nullish() }));
  const { pathname } = useRouter();
  const isNotificationsPage = pathname === "/notifications";

  const { data } = useNotificationsQuery(communityId as string, { enabled: Boolean(communityId) });

  const renderNotificationTab = ({
    id,
    type,
    post,
    booking,
    creator_id,
    notifier_id,
    recipient_id,
  }: TGetNotificationsResponse["notifications"][number]): ReactElement => {
    if (type === "BOOKING" && booking) {
      return (
        <Link href={`/notifications/${id}`}>
          <NotificationTab.Booking booking={booking} creatorId={creator_id} notifierId={notifier_id} />
        </Link>
      );
    }

    if (type === "REQUEST" && post) {
      return <NotificationTab.Request notifierId={notifier_id} post={post} />;
    }

    return (
      <Link href={`/notifications/${id}`}>
        <NotificationTab.Chat
          creatorId={creator_id}
          notificationId={id}
          notifierId={notifier_id}
          recipientId={recipient_id}
        />
      </Link>
    );
  };

  return (
    <div className="mx-auto flex w-[1280px] flex-1">
      <div className="">
        {data?.notifications.map((notification) => (
          <div
            className={`hover:bg-stone-200 ${query?.id === notification.id ? "bg-stone-200" : ""}`}
            key={notification.id}
          >
            {renderNotificationTab(notification)}
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        {isNotificationsPage ? <p className="m-auto text-sm">Click on a notification to checkout</p> : children}
      </div>
    </div>
  );
};
