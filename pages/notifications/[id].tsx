import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import moment from "moment";
import { transformImgUrl } from "../../lib";
import { queries, mutations, subscriptions } from "../../lib/gql";
import { TimeFrame, BookingStatus, NotificationType } from "../../lib/enums";
import { tokenPayloadVar, communityIdVar } from "../_app";
import { Container, Spinner, SVG } from "../../components/Container";
import type {
  NotificationData,
  NotificationVars,
  CreateMessageData,
  CreateMessageVars,
  UpdateBookingData,
  UpdateBookingVars,
} from "../../lib/types";

export default function NotificationDetails() {
  const router = useRouter();
  const notificationId = router.query.id;
  const [text, setText] = useState("");
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const { subscribeToMore, loading, error, data } = useQuery<
    NotificationData,
    NotificationVars
  >(queries.GET_NOTIFICATION, {
    skip: !notificationId,
    fetchPolicy: "network-only",
    variables: { notificationId: notificationId?.toString()! },
  });

  const [createMessage, { error: mutationError }] = useMutation<
    CreateMessageData,
    CreateMessageVars
  >(mutations.CREATE_MESSAGE, {
    onCompleted() {
      setText("");
    },
  });

  const [updateBooking, { loading: mutationLoading }] = useMutation<
    UpdateBookingData,
    UpdateBookingVars
  >(mutations.UPDATE_BOOKING, {
    onError({ message }) {
      console.warn(message);
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: subscriptions.MESSAGES_SUBSCRIPTION,
      variables: { notificationId: notificationId?.toString()! },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          ...prev,
          notification: {
            ...prev.notification,
            messages: [
              ...prev.notification.messages,
              // @ts-ignore
              subscriptionData.data.notificationMessage,
            ],
          },
        };
      },
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, [notificationId]);

  return (
    <Container community={false} loading={loading} error={error}>
      <div className="notification-details-control">
        <div className="notification-info">
          <>
            <div className="info-imgs">
              {data?.notification.creator && (
                <div className="user-img user">
                  <Image
                    alt="profile pic"
                    src={
                      data.notification.creator.imageUrl
                        ? transformImgUrl(
                            data.notification.creator.imageUrl,
                            200
                          )
                        : "/profile-img.png"
                    }
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              {data?.notification.recipient && (
                <div className="user-img recipient">
                  <Image
                    alt="profile pic"
                    src={
                      data.notification.recipient.imageUrl
                        ? transformImgUrl(
                            data.notification.recipient.imageUrl,
                            200
                          )
                        : "/profile-img.png"
                    }
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
            </div>
          </>
          {data?.notification.type === NotificationType.CHAT && (
            <>
              <p>
                You -{" "}
                {data?.notification.creator.id === tokenPayload?.userId
                  ? data.notification.recipient.name
                  : data.notification.creator.name}
              </p>
            </>
          )}
          {data?.notification.type === NotificationType.BOOKING &&
            data.notification.booking &&
            tokenPayload && (
              <div className="item-info">
                <div className="item-status">
                  <p
                    className="p-link"
                    role="presentation"
                    onClick={() =>
                      router.push(
                        `/posts/${data.notification.booking?.post.id}`
                      )
                    }
                  >
                    {data.notification.booking.post.title}
                  </p>
                  {data.notification.booking.timeFrame === TimeFrame.ASAP ? (
                    <span>As soon as possible</span>
                  ) : data.notification.booking.timeFrame ===
                    TimeFrame.RANDOM ? (
                    <span>No time frame</span>
                  ) : (
                    <span>
                      {moment(+data.notification.booking.dateNeed).format(
                        "DD.MM.Y"
                      )}{" "}
                      -{" "}
                      {moment(+data.notification.booking.dateReturn).format(
                        "DD.MM.Y"
                      )}
                    </span>
                  )}
                </div>
                <div className="item-btns">
                  {data?.notification?.booking?.booker.id ===
                  tokenPayload.userId ? (
                    <>
                      {data?.notification?.booking?.status ===
                      BookingStatus.PENDING ? (
                        <button
                          type="button"
                          className="noti-btn status pending"
                        >
                          Pending
                        </button>
                      ) : data?.notification?.booking?.status ===
                        BookingStatus.ACCEPTED ? (
                        <button
                          type="button"
                          className="noti-btn status accept"
                        >
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
                      {data?.notification?.booking?.status ===
                      BookingStatus.PENDING ? (
                        <>
                          <button
                            type="button"
                            className="noti-btn accept"
                            onClick={(e) => {
                              e.preventDefault();
                              updateBooking({
                                variables: {
                                  bookingInput: {
                                    status: BookingStatus.ACCEPTED,
                                    bookingId: data.notification.booking!.id,
                                    communityId: communityId!,
                                    notificationId: data?.notification.id,
                                  },
                                },
                              });
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="noti-btn deny"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              updateBooking({
                                variables: {
                                  bookingInput: {
                                    status: BookingStatus.DECLINED,
                                    bookingId: data.notification.booking!.id,
                                    communityId: communityId!,
                                    notificationId: data?.notification.id,
                                  },
                                },
                              });
                            }}
                          >
                            Deny
                          </button>
                        </>
                      ) : data?.notification?.booking?.status ===
                        BookingStatus.ACCEPTED ? (
                        <button
                          type="button"
                          className="noti-btn status accept"
                        >
                          Accepted
                        </button>
                      ) : (
                        <button type="button" className="noti-btn status deny">
                          Denied
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
        <div className="notification-chat">
          <ul className="chat-content">
            {data?.notification.messages.map((message) => (
              <li
                key={message.id}
                className={
                  message.creator.id === tokenPayload?.userId
                    ? "send"
                    : "received"
                }
              >
                {message.content}
              </li>
            ))}
          </ul>
          <div className="chat-input">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyUp={(e) => {
                const keyCode = e.keyCode || e.which;
                if (data && keyCode === 13 && text !== "") {
                  createMessage({
                    variables: {
                      messageInput: {
                        content: text,
                        communityId: communityId!,
                        recipientId:
                          data.notification.creator.id === tokenPayload?.userId
                            ? data.notification.recipient.id
                            : data.notification.creator.id,
                        notificationId: notificationId!.toString(),
                      },
                    },
                  });
                }
              }}
            />
            <SVG
              className="send-icon"
              icon="paperPlane"
              onClick={() => {
                if (data && text !== "") {
                  createMessage({
                    variables: {
                      messageInput: {
                        content: text,
                        communityId: communityId!,
                        recipientId:
                          data.notification.creator.id === tokenPayload?.userId
                            ? data.notification.recipient.id
                            : data.notification.creator.id,
                        notificationId: notificationId!.toString(),
                      },
                    },
                  });
                }
              }}
            />
          </div>
        </div>
        {mutationError && <p>Error :( Please try again</p>}
        {mutationLoading && <Spinner cover />}
        <style jsx>
          {`
            @import "../index.scss";

            .notification-details-control {
              display: flex;
              flex-direction: column;

              p {
                margin: auto 10px;
                display: block;
                font-size: 16px;

                &.p-link {
                  &:hover {
                    cursor: pointer;
                  }
                }
              }

              span {
                margin: auto 10px;
                display: block;
                font-size: 14px;
              }

              .noti-btn {
                margin: auto 5px;
              }

              .notification-info {
                display: flex;
                justify-content: center;
                width: 100vw;
                height: 95px;
                background: $grey-100;

                .info-imgs {
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  .user-img {
                    height: 45px;
                    width: 45px;
                    border-radius: 50%;
                    position: relative;
                    overflow: hidden;

                    &.recipient {
                      left: -7%;
                    }
                  }
                }

                .item-info {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-evenly;

                  .item-btns {
                    display: flex;
                    justify-content: space-evenly;
                  }
                }
              }

              .notification-chat {
                flex: 1 1 0%;
                flex-direction: column;
                display: flex;
                overflow-y: scroll;

                .chat-content {
                  flex: 1 1 0%;
                  overflow-y: auto;
                  padding: 10px 25px;
                  list-style-type: none;

                  .received {
                    font-size: 17px;
                    margin: 5px auto;
                    padding: 7px 15px;
                    clear: both;
                    float: left;
                    line-height: 1.3;
                    max-width: 230px;
                    color: $black;
                    background: $grey-200;
                    border-radius: 20px;
                  }

                  .send {
                    font-size: 17px;
                    margin: 5px auto;
                    padding: 7px 15px;
                    clear: both;
                    float: right;
                    line-height: 1.3;
                    max-width: 230px;
                    color: $background;
                    background: #03ad008c;
                    border-radius: 20px;
                  }
                }

                .chat-input {
                  width: 100%;
                  height: 60px;
                  background: $grey-200;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  input {
                    height: 14px;
                    width: 68vw;
                    border-width: 0;
                    padding: 10px;
                    color: #a0998f;
                    background: $background;
                    font-size: 15px;
                    border-radius: 18px;
                  }
                }
              }
            }
          `}
        </style>
        <style jsx global>
          {`
            @import "../index.scss";

            .send-icon {
              color: $orange;
              width: 20px;
              border-radius: 50%;
              padding: 12px;
              cursor: pointer;
              margin-left: 10px;

              &:hover {
                background: $grey-100;
              }
            }
          `}
        </style>
      </div>
    </Container>
  );
}
