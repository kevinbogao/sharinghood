import { useState, useEffect, RefObject } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  useQuery,
  useMutation,
  useReactiveVar,
  useApolloClient,
} from "@apollo/client";
import moment from "moment";
import { transformImgUrl } from "../../lib/";
import { queries, mutations } from "../../lib/gql";
import { TimeFrame, BookingStatus, NotificationType } from "../../lib/enums";
import { communityIdVar, tokenPayloadVar } from "../_app";
import { Container, Spinner } from "../../components/Container";
import type {
  UpdateBookingData,
  UpdateBookingVars,
  UserCommunitiesData,
  PaginatedNotificationsData,
  PaginatedNotificationsVars,
} from "../../lib/types";

interface NotificationsProps {
  parent: RefObject<HTMLDivElement>;
}

export default function Notifications({ parent }: NotificationsProps) {
  const router = useRouter();
  const client = useApolloClient();
  const [limit, setLimit] = useState(0);
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);

  useEffect(() => {
    if (!parent.current) return;

    const { clientHeight } = parent.current;
    const rows = Math.floor(clientHeight / 146) + 3;
    setLimit(rows > 10 ? rows : 10);
    // eslint-disable-next-line
  }, []);

  const { loading, error, data, fetchMore } = useQuery<
    PaginatedNotificationsData,
    PaginatedNotificationsVars
  >(queries.GET_PAGINATED_NOTIFICATIONS, {
    fetchPolicy: "network-only",
    skip: !communityId,
    variables: { offset: 0, limit, communityId: communityId! },
    onCompleted() {
      const communitiesCache = client.readQuery<UserCommunitiesData, void>({
        query: queries.GET_USER_COMMUNITIES,
      });
      if (!communitiesCache) return;

      client.writeQuery<UserCommunitiesData, void>({
        query: queries.GET_USER_COMMUNITIES,
        data: {
          communities: communitiesCache.communities.map((community) =>
            community.id === communityId
              ? { ...community, notificationCount: 0 }
              : community
          ),
        },
      });
    },
  });

  function onScroll() {
    if (parent.current) {
      const { scrollTop, scrollHeight, clientHeight } = parent.current;
      if (scrollTop + clientHeight === scrollHeight) {
        if (!data?.paginatedNotifications.hasMore) return;
        fetchMore<PaginatedNotificationsData, PaginatedNotificationsVars>({
          variables: {
            offset: data?.paginatedNotifications.notifications.length,
            limit: 10,
          },

          updateQuery(prev, { fetchMoreResult }) {
            if (!fetchMoreResult) return prev;
            return {
              ...prev,
              paginatedNotifications: {
                ...prev.paginatedNotifications,
                notifications: [
                  ...prev.paginatedNotifications.notifications,
                  ...fetchMoreResult.paginatedNotifications.notifications,
                ],
                hasMore: fetchMoreResult.paginatedNotifications.hasMore,
              },
            };
          },
        });
      }
    }
  }

  useEffect(() => {
    let node: HTMLDivElement | null = null;

    if (parent.current) {
      node = parent.current;
      node.addEventListener("scroll", onScroll);
    }

    return () => {
      if (node) node.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line
  }, [data]);

  const [updateBooking, { loading: mutationLoading }] = useMutation<
    UpdateBookingData,
    UpdateBookingVars
  >(mutations.UPDATE_BOOKING, {
    onError({ message }) {
      console.log(message);
    },
  });

  return (
    <Container loading={loading || !communityId} error={error}>
      {data?.paginatedNotifications &&
      data?.paginatedNotifications.notifications.length > 0 &&
      tokenPayload ? (
        <div className="notifications-control">
          {data.paginatedNotifications.notifications.map((notification) => {
            const userIsCreator =
              notification.creator.id === tokenPayload.userId;

            const user = userIsCreator
              ? notification.creator
              : notification.recipient;

            const receiver = userIsCreator
              ? notification.recipient
              : notification.creator;

            return (
              <div
                key={notification.id}
                className="notification-item"
                role="presentation"
                onClick={() => {
                  if (
                    notification.type === NotificationType.REQUEST &&
                    notification.post
                  )
                    router.push(`/posts/${notification.post.id}`);
                  else router.push(`/notifications/${notification.id}`);
                }}
              >
                {notification.type === NotificationType.CHAT ? (
                  <>
                    <div className="left-img">
                      <div
                        className={`noti-img-border ${
                          notification.notifier?.id === user.id && "unread"
                        }`}
                      >
                        <div className="noti-img">
                          <Image
                            alt="profile pic"
                            src={
                              receiver.imageUrl
                                ? transformImgUrl(receiver.imageUrl, 300)
                                : "/profile-img.png"
                            }
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="message-info">
                      <div className="message-user">
                        <p className="title name">{receiver.name}</p>
                      </div>
                      <div className="message-text">
                        {notification.paginatedMessages.messages?.length > 0 ? (
                          <p className="text">
                            {notification.paginatedMessages.messages[0].content}
                          </p>
                        ) : (
                          <p className="text">
                            Send a message to {receiver.name} now
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : notification.type === NotificationType.BOOKING &&
                  notification.booking ? (
                  <>
                    <div className="left-img">
                      <div
                        className={`noti-img-border ${
                          notification.notifier?.id === user.id && "unread"
                        }`}
                      >
                        <div className="noti-img">
                          <Image
                            alt="profile pic"
                            src={transformImgUrl(
                              notification.booking.post.imageUrl,
                              300
                            )}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="item-info">
                      <div className="item-status">
                        {notification.booking.booker.id === user.id ? (
                          <p className="title">
                            You requested {receiver.name}
                            &apos;s {notification.booking.post.title}
                          </p>
                        ) : (
                          <p className="title">
                            {receiver.name} requested your{" "}
                            {notification.booking.post.title}
                          </p>
                        )}
                        {notification.booking.timeFrame === TimeFrame.ASAP ? (
                          <span>As soon as possible</span>
                        ) : notification.booking.timeFrame ===
                          TimeFrame.RANDOM ? (
                          <span>No time frame</span>
                        ) : (
                          <span>
                            {moment(+notification.booking.dateNeed).format(
                              "DD.MM.Y"
                            )}{" "}
                            -{" "}
                            {moment(+notification.booking.dateReturn).format(
                              "DD.MM.Y"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="item-btns">
                        {notification.booking.booker.id === user.id ? (
                          <>
                            {notification.booking.status ===
                            BookingStatus.PENDING ? (
                              <button
                                type="button"
                                className="noti-btn status pending"
                              >
                                Pending
                              </button>
                            ) : notification.booking.status ===
                              BookingStatus.ACCEPTED ? (
                              <button
                                type="button"
                                className="noti-btn status accept"
                              >
                                Accepted
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="noti-btn status deny"
                              >
                                Denied
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {notification.booking.status ===
                            BookingStatus.PENDING ? (
                              <>
                                <button
                                  type="button"
                                  className="noti-btn accept"
                                  onClick={(e) => {
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
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  className="noti-btn deny"
                                  onClick={(e) => {
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
                                  Deny
                                </button>
                              </>
                            ) : notification.booking.status ===
                              BookingStatus.ACCEPTED ? (
                              <button
                                type="button"
                                className="noti-btn status accept"
                              >
                                Accepted
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="noti-btn status deny"
                              >
                                Denied
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="left-img">
                      <div
                        className={`noti-img-border ${
                          notification.notifier?.id === user.id && "unread"
                        }`}
                      >
                        <div className="noti-img">
                          <Image
                            alt="profile pic"
                            src={transformImgUrl(
                              notification.post!.imageUrl,
                              300
                            )}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="item-info">
                      <div className="item-status">
                        {notification.post?.creator.id === user.id ? (
                          <p className="title">
                            You uploaded an item for {receiver.name}&apos;
                            request!
                          </p>
                        ) : (
                          <p className="title">
                            {receiver.name} uploaded an item for your request!
                          </p>
                        )}
                      </div>
                      <div className="item-btns">
                        <button
                          type="button"
                          className="noti-btn status request"
                        >
                          Request now
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <p className="main-p full">You do not have any notifications yet</p>
        </div>
      )}
      {mutationLoading && <Spinner cover />}
      <style jsx>
        {`
          @import "../index.scss";

          .notifications-control {
            .notification-item {
              margin: 15px;
              display: flex;
              background: $grey-100;
              width: 320px;

              &:hover {
                cursor: pointer;
                background: $grey-200;
              }

              p {
                &.title {
                  margin: auto 10px;
                  display: block;
                  font-size: 16px;

                  &.name {
                    margin: 8px 10px;
                  }
                }
              }

              span {
                margin: auto 10px;
                display: block;
                font-size: 14px;
              }

              .noti-img-border {
                height: 96px;
                width: 96px;
                margin: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border-radius: 50%;

                @include sm {
                  height: 86px;
                  width: 86px;
                }

                &.unread {
                  background: $orange;
                }
              }

              .noti-img {
                height: 90px;
                width: 90px;
                border-radius: 50%;
                position: relative;
                overflow: hidden;

                @include sm {
                  height: 80px;
                  width: 80px;
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

              .message-info {
                display: flex;
                flex-direction: column;

                .message-user {
                  height: 10px;
                }

                .message-text {
                  flex: 1 1 0%;
                  display: flex;
                  align-items: center;

                  .text {
                    display: block;
                    font-size: 14px;
                    margin: auto 10px;
                  }
                }
              }
            }
          }

          .empty {
            display: flex;
          }
        `}
      </style>
    </Container>
  );
}
