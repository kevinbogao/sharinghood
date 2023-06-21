import { BookingStatusEnum } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { FC, PropsWithChildren, ReactElement } from "react";
import { useState } from "react";

import { useUpdateBookingMutation } from "../hooks/api/BookingHooks";
import { useMessagesQuery } from "../hooks/api/MessageHooks";
import { useCommunityMember } from "../hooks/useCommunityMember";
import { useSession } from "../hooks/useSession";
import { formatDate } from "../lib/utils/date";
import type { TGetNotificationsResponse } from "../pages/api/notifications";

interface IBaseNotificationTab {
  imageUrl: string;
  notifierId: string | null;
  userId?: string;
}

const BaseNotificationTab: FC<PropsWithChildren<IBaseNotificationTab>> = ({
  userId,
  imageUrl,
  notifierId,
  children,
}) => (
  <div className="flex flex-1 items-center p-2">
    <Image
      alt="A profile picture"
      className="h-15 w-15 overflow-hidden rounded-full object-cover"
      height={200}
      src={imageUrl}
      width={200}
    />
    <div className="flex flex-col px-4">{children}</div>
    <div className="w-2.5">
      {userId === notifierId && <div className="aspect-square h-2.5 w-2.5 rounded-full bg-red-500" />}
    </div>
  </div>
);

interface IChat {
  creatorId: string;
  recipientId: string;
  notificationId: string;
  notifierId: string | null;
}

const Chat: FC<IChat> = ({ creatorId, recipientId, notifierId, notificationId }) => {
  const { user } = useSession();
  const { getMember } = useCommunityMember();

  const { data } = useMessagesQuery(notificationId);

  const isUserCreator = creatorId === user?.id;
  const memberId = isUserCreator ? recipientId : creatorId;
  const member = getMember(memberId);

  const lastMessage = data?.messages[data.messages.length - 1]?.content ?? `Message ${member?.name} now`;

  return (
    <BaseNotificationTab imageUrl={member?.image_url as string} notifierId={notifierId} userId={user?.id}>
      <div className="flex w-60 flex-col">
        <p className="text-base font-medium">{member?.name}</p>
        <p className="text-sm">{lastMessage}</p>
      </div>
    </BaseNotificationTab>
  );
};

interface IRequest {
  notifierId: string | null;
  post: NonNullable<TGetNotificationsResponse["notifications"][number]["post"]>;
}

const Request: FC<IRequest> = ({ notifierId, post: { id, creator_id, image_url, title } }) => {
  const { user } = useSession();
  const { getMember } = useCommunityMember();
  const creator = getMember(creator_id);

  const isUserCreator = creator_id === user?.id;

  if (isUserCreator) {
    return null;
  }

  return (
    <Link href={`/items/${id}`}>
      <BaseNotificationTab imageUrl={image_url} notifierId={notifierId} userId={user?.id}>
        <div className="flex w-60 flex-col">
          <p className="text-sm">
            <span className="text-base font-medium">{creator?.name}</span> shared{" "}
            <span className="text-base font-medium">{title}</span> for your request
          </p>
        </div>
      </BaseNotificationTab>
    </Link>
  );
};

interface IBooking {
  booking: NonNullable<TGetNotificationsResponse["notifications"][number]["booking"]>;
  creatorId: string;
  notifierId: string | null;
}

type TButtonType = "ACCEPTED" | "DECLINED" | "PENDING";

const BUTTON_CLASS_NAME_MAP: Record<TButtonType, string> = {
  ACCEPTED: "mx-2 flex-1 rounded-md border-2 border-green-400 py-0.5 text-green-400",
  DECLINED: "mx-2 flex-1 rounded-md border-2 border-red-500 py-0.5 text-red-500",
  PENDING: "mx-2 flex-1 rounded-md border-2 border-black py-0.5 text-black",
};

const Booking: FC<IBooking> = ({
  creatorId,
  notifierId,
  booking: {
    id,
    status,
    date_need,
    date_return,
    time_frame,
    post: { image_url, title, creator_id },
  },
}) => {
  const [bookingStatus, setBookingStatus] = useState(status);
  const { user } = useSession();
  const { getMember } = useCommunityMember();

  const { mutate } = useUpdateBookingMutation({
    onSuccess: ({ booking }) => {
      setBookingStatus(booking.status);
    },
  });

  const owner = getMember(creator_id);
  const requester = getMember(creatorId);
  const isUserOwner = user?.id === creator_id;
  const ownerName = isUserOwner ? "your" : owner?.name;
  const requesterName = isUserOwner ? requester?.name : "You";

  const renderLabel = (): ReactElement => (
    <p className="w-60 truncate text-sm">
      <span className="text-base font-medium">{requesterName}</span> requested{" "}
      {isUserOwner ? ownerName : <span className="text-base font-medium">{ownerName}</span>}
      {!isUserOwner && "'s"} <span className="text-base font-medium">{title}</span>
    </p>
  );

  const renderBookingStatus = (): ReactElement => {
    if (bookingStatus === BookingStatusEnum.ACCEPTED) {
      return (
        <button className={BUTTON_CLASS_NAME_MAP.ACCEPTED} type="button">
          Accepted
        </button>
      );
    }

    if (bookingStatus === BookingStatusEnum.DECLINED) {
      return (
        <button className={BUTTON_CLASS_NAME_MAP.DECLINED} type="button">
          Declined
        </button>
      );
    }

    if (isUserOwner) {
      return (
        <>
          <button
            className="mx-2 flex-1 rounded-md border-2 border-green-400 bg-green-400 py-0.5 text-white hover:bg-white hover:text-green-400"
            onClick={() => mutate({ id, status: BookingStatusEnum.ACCEPTED })}
            type="button"
          >
            Accept
          </button>
          <button
            className="mx-2 flex-1 rounded-md border-2 border-red-500 bg-red-500 py-0.5 text-white hover:bg-white hover:text-red-500"
            onClick={(e) => {
              e.preventDefault();
              mutate({ id, status: BookingStatusEnum.DECLINED });
            }}
            type="button"
          >
            Decline
          </button>
        </>
      );
    }

    return (
      <button className={BUTTON_CLASS_NAME_MAP.PENDING} type="button">
        Pending
      </button>
    );
  };

  const getTimeLable = (): string => {
    if (time_frame === "SPECIFIC" && date_need) {
      if (date_return) {
        return `${formatDate(date_need)} - ${formatDate(date_return)}`;
      }

      return formatDate(date_need);
    }

    if (time_frame === "ASAP") {
      return "As soon as possible";
    }

    return "No time specified";
  };

  return (
    <BaseNotificationTab imageUrl={image_url} notifierId={notifierId} userId={user?.id}>
      {renderLabel()}
      <p className="text-sm">{getTimeLable()}</p>
      <div className="mt-2 flex flex-1">{renderBookingStatus()}</div>
    </BaseNotificationTab>
  );
};

interface INotificationTab {
  Chat: FC<IChat>;
  Request: FC<IRequest>;
  Booking: FC<IBooking>;
}

export const NotificationTab: INotificationTab = {
  Chat,
  Request,
  Booking,
};
