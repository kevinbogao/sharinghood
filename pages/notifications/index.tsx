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
  NotificationsData,
  NotificationsVars,
  UpdateBookingData,
  UpdateBookingVars,
  UserCommunitiesData,
} from "../../lib/types";
import { useEffect } from "react";

export default function Notifications(props: any) {
  const router = useRouter();
  const client = useApolloClient();
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);

  const { loading, error, data, fetchMore } = useQuery<
    NotificationsData,
    NotificationsVars
  >(queries.GET_NOTIFICATIONS, {
    skip: !communityId,
    fetchPolicy: "network-only",
    variables: { offset: 0, limit: 10, communityId: communityId! },
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
      <div className="notifications-control">
        {data?.notifications && tokenPayload ? (
          <>
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
                role="presentation"
                // Redirect to post if notification type is 2 else go to notification details
                onClick={() => {
                  if (
                    notification.type === NotificationType.REQUEST &&
                    notification.post
                  ) {
                    router.push(`/posts/${notification.post.id}`);
                  } else {
                    router.push(`/notifications/${notification.id}`);
                  }
                }}
              >
                {notification.type === NotificationType.CHAT ? (
                  <>
                    <div className="left-img">
                      <div
                        className={`noti-img-border ${
                          notification.notifier?.id === tokenPayload.userId &&
                          "unread"
                        }`}
                      >
                        <div className="noti-img">
                          <Image
                            alt="profile pic"
                            src={
                              notification.recipient.imageUrl
                                ? transformImgUrl(
                                    notification.recipient.imageUrl,
                                    300
                                  )
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
                        <p className="title name">
                          {notification.recipient.name}
                        </p>
                      </div>
                      <div className="message-text">
                        {notification.messages?.length > 0 ? (
                          <p className="text">
                            {
                              notification.messages[
                                notification.messages.length - 1
                              ].content
                            }
                          </p>
                        ) : (
                          <p className="text">
                            Send a message to {notification.recipient.name} now
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
                          notification.notifier?.id === tokenPayload.userId &&
                          "unread"
                        }`}
                      >
                        <div
                          className="noti-img"
                          style={{
                            backgroundImage: `url(${transformImgUrl(
                              notification.booking.post.imageUrl,
                              300
                            )})`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="item-info">
                      <div className="item-status">
                        {notification.booking.booker.id ===
                        tokenPayload.userId ? (
                          <p className="title">
                            You requested {notification.recipient.name}
                            &apos;s {notification.booking.post.title}
                          </p>
                        ) : (
                          <p className="title">
                            {notification.creator.name} requested your{" "}
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
                        {notification.booking.booker.id ===
                        tokenPayload.userId ? (
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
                  notification.post?.creator.id !== tokenPayload.userId && (
                    <>
                      <div className="left-img">
                        <div
                          className={`noti-img-border ${
                            notification.notifier?.id === tokenPayload.userId &&
                            "unread"
                          }`}
                        >
                          <div className="noti-img">
                            <Image
                              alt="profile pic"
                              src={
                                notification.creator.imageUrl
                                  ? transformImgUrl(
                                      notification.creator.imageUrl,
                                      300
                                    )
                                  : "/profile-img.png"
                              }
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="item-info">
                        <div className="item-status">
                          <p className="title">
                            {notification?.post?.creator.name} uploaded a item
                            for your request!
                          </p>
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
                  )
                )}
              </div>
            ))}
          </>
        ) : (
          <p className="main-p full">You do not have any notifications yet</p>
        )}

        <button
          onClick={() => {
            fetchMore({
              variables: {
                offset: data?.notifications.length,
                limit: 10,
                communityId: communityId!,
              },
            });
          }}
        >
          More
        </button>
        {mutationLoading && <Spinner cover />}
        <style jsx>
          {`
            @import "../index.scss";

            .notifications-control {
              margin: 20px auto 30px auto;

              @include sm {
                margin: 15px auto 30px auto;
              }

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
                  background-size: cover;
                  background-position: center;
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
          `}
        </style>
      </div>
    </Container>
  );
}
