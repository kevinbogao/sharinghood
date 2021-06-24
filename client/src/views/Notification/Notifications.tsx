import { History } from "history";
import {
  useQuery,
  useMutation,
  useApolloClient,
  useReactiveVar,
} from "@apollo/client";
import moment from "moment";
import Spinner from "../../components/Spinner";
import ServerError from "../../components/ServerError";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { tokenPayloadVar } from "../../utils/cache";
import { transformImgUrl } from "../../utils/helpers";

interface NotificationsProps {
  history: History;
  communityId: string;
}

export default function Notifications({
  history,
  communityId,
}: NotificationsProps) {
  const client = useApolloClient();
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const { loading, error, data } = useQuery<
    typeDefs.NotificationsData,
    typeDefs.NotificationsVars
  >(queries.GET_NOTIFICATIONS, {
    variables: { communityId },
    fetchPolicy: "network-only",
    onCompleted: () => {
      // Get communities from cache
      const communitiesCache = client.readQuery<
        typeDefs.UserCommunitiesData,
        void
      >({
        query: queries.GET_USER_COMMUNITIES,
      });

      // Write to cache with a new communities array with the current
      // community's hasNotifications is set to false
      if (communitiesCache) {
        client.writeQuery<typeDefs.UserCommunitiesData, void>({
          query: queries.GET_USER_COMMUNITIES,
          data: {
            communities: communitiesCache.communities.map((community) =>
              community._id === communityId
                ? { ...community, hasNotifications: false }
                : community
            ),
          },
        });
      }
    },
  });

  // Update booking status by changing booking status int
  // 0: pending
  // 1: accepted
  // 2: declined
  const [updateBooking, { loading: mutationLoading }] = useMutation<
    typeDefs.UpdateBookingData,
    typeDefs.UpdateBookingVars
  >(mutations.UPDATE_BOOKING, {
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <div className="notifications-control">
      {data?.notifications.length && tokenPayload ? (
        <>
          {data.notifications.map((notification) => (
            <div
              key={notification._id}
              className="notification-item"
              role="presentation"
              // Redirect to post if notification type is 2 else go to notification details
              onClick={() => {
                if (notification.ofType === 2 && notification.post) {
                  history.push(`/shared/${notification.post._id}`);
                } else {
                  history.push(`/notification/${notification._id}`);
                }
              }}
            >
              {notification.ofType === 0 ? (
                <>
                  <div className="left-img">
                    <div
                      className={`noti-img-border ${
                        notification.isRead[tokenPayload.userId]
                          ? undefined
                          : "unread"
                      }
                      `}
                    >
                      <div
                        className="noti-img"
                        style={{
                          backgroundImage: `url(${transformImgUrl(
                            JSON.parse(notification.participants[0].image)
                              .secure_url,
                            300
                          )})`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="message-info">
                    <div className="message-user">
                      <p className="title name">
                        {notification.participants[0].name}
                      </p>
                    </div>
                    <div className="message-text">
                      {notification.messages.length > 0 ? (
                        <p className="text">
                          {
                            notification.messages[
                              notification.messages.length - 1
                            ].text
                          }
                        </p>
                      ) : (
                        <p className="text">
                          Send a message to {notification.participants[0].name}{" "}
                          now
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : notification.ofType === 1 && notification.booking ? (
                <>
                  <div className="left-img">
                    <div
                      className={`noti-img-border ${
                        notification.isRead[tokenPayload.userId]
                          ? undefined
                          : "unread"
                      }
                  `}
                    >
                      <div
                        className="noti-img"
                        style={{
                          backgroundImage: `url(${transformImgUrl(
                            JSON.parse(notification.booking.post.image)
                              .secure_url,
                            300
                          )})`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="item-info">
                    <div className="item-status">
                      {notification.booking.booker._id ===
                      tokenPayload.userId ? (
                        <p className="title">
                          You requested {notification.participants[0].name}
                          &apos;s {notification.booking.post.title}
                        </p>
                      ) : (
                        <p className="title">
                          {notification.participants[0].name} requested your{" "}
                          {notification.booking.post.title}
                        </p>
                      )}
                      {notification.booking.dateType === 0 ? (
                        <span>As soon as possible</span>
                      ) : notification.booking.dateType === 1 ? (
                        <span>No timeframe</span>
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
                      {notification.booking.booker._id ===
                      tokenPayload.userId ? (
                        <>
                          {notification.booking.status === 0 ? (
                            <button
                              type="button"
                              className="noti-btn status pending"
                            >
                              Pending
                            </button>
                          ) : notification.booking.status === 1 ? (
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
                          {notification.booking.status === 0 ? (
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
                                        status: 1,
                                        bookingId: notification?.booking?._id,
                                        communityId,
                                        notificationId: notification._id,
                                        notifyContent: `${tokenPayload.userName} has accepted your booking on ${notification?.booking?.post.title}`,
                                        notifyRecipientId:
                                          notification?.booking?.booker._id,
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
                                        status: 2,
                                        bookingId: notification?.booking?._id,
                                        communityId,
                                        notificationId: notification._id,
                                        notifyContent: `${tokenPayload.userName} has denied your booking on ${notification?.booking?.post.title}`,
                                        notifyRecipientId:
                                          notification?.booking?.booker._id,
                                      },
                                    },
                                  });
                                }}
                              >
                                Deny
                              </button>
                            </>
                          ) : notification.booking.status === 1 ? (
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
                        notification.isRead[tokenPayload.userId]
                          ? undefined
                          : "unread"
                      }
                  `}
                    >
                      <div
                        className="noti-img"
                        style={{
                          backgroundImage: `url(${transformImgUrl(
                            JSON.parse(notification.participants[0].image)
                              .secure_url,
                            300
                          )})`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="item-info">
                    <div className="item-status">
                      <p className="title">
                        {notification?.post?.creator.name} uploaded a item for
                        your request!
                      </p>
                    </div>
                    <div className="item-btns">
                      <button type="button" className="noti-btn status request">
                        Request now
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      ) : (
        <p className="main-p full">You do not have any notifications yet</p>
      )}
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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
  );
}