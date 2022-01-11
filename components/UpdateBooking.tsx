import { useState } from "react";
import { useMutation } from "@apollo/client";
import { mutations } from "../lib/gql";
import { BookingStatus } from "../lib/enums";
import { Loader } from "./Container";
import type {
  Notification,
  UpdateBookingData,
  UpdateBookingVars,
} from "../lib/types";

interface UpdateBookingProps {
  userId: string;
  communityId: string | null;
  notification: Notification;
}

export default function UpdateBooking({
  userId,
  communityId,
  notification,
}: UpdateBookingProps) {
  const [isAccept, setIsAccept] = useState<boolean | null>(null);
  const [selNotificationId, setSelNotificationId] = useState<string | null>(
    null
  );

  const [updateBooking, { loading: mutationLoading }] = useMutation<
    UpdateBookingData,
    UpdateBookingVars
  >(mutations.UPDATE_BOOKING, {
    onCompleted() {
      setIsAccept(null);
      setSelNotificationId(null);
    },
    onError({ message }) {
      console.log(message);
    },
  });

  return (
    <div className="item-btns">
      {notification.booking?.booker.id === userId ? (
        <>
          {notification.booking.status === BookingStatus.PENDING ? (
            <button type="button" className="noti-btn status pending">
              Pending
            </button>
          ) : notification.booking.status === BookingStatus.ACCEPTED ? (
            <button type="button" className="noti-btn status accept">
              Accepted
            </button>
          ) : (
            <button type="button" className="noti-btn status deny">
              Denied
            </button>
          )}
        </>
      ) : (
        <>
          {notification.booking?.status === BookingStatus.PENDING ? (
            <>
              <button
                type="button"
                className="noti-btn accept"
                onClick={(e) => {
                  setIsAccept(true);
                  setSelNotificationId(notification.id);
                  e.stopPropagation();
                  e.preventDefault();
                  updateBooking({
                    variables: {
                      bookingInput: {
                        status: BookingStatus.ACCEPTED,
                        bookingId: notification.booking!.id,
                        communityId: communityId!,
                        notificationId: notification.id,
                      },
                    },
                  });
                }}
              >
                {mutationLoading &&
                isAccept &&
                notification.id === selNotificationId ? (
                  <Loader small color="green" />
                ) : (
                  "Accept"
                )}
              </button>
              <button
                type="button"
                className="noti-btn deny"
                onClick={(e) => {
                  setIsAccept(false);
                  setSelNotificationId(notification.id);
                  e.stopPropagation();
                  e.preventDefault();
                  updateBooking({
                    variables: {
                      bookingInput: {
                        status: BookingStatus.DECLINED,
                        bookingId: notification.booking!.id,
                        communityId: communityId!,
                        notificationId: notification.id,
                      },
                    },
                  });
                }}
              >
                {mutationLoading &&
                !isAccept &&
                notification.id === selNotificationId ? (
                  <Loader small color="red" />
                ) : (
                  "Deny"
                )}
              </button>
            </>
          ) : notification.booking?.status === BookingStatus.ACCEPTED ? (
            <button type="button" className="noti-btn status accept">
              Accepted
            </button>
          ) : (
            <button type="button" className="noti-btn status deny">
              Denied
            </button>
          )}
        </>
      )}
      <style jsx>
        {`
          .item-btns {
            display: flex;
            justify-content: space-evenly;
          }
        `}
      </style>
    </div>
  );
}
