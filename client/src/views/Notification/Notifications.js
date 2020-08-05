import React from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
import moment from 'moment';
import Spinner from '../../components/Spinner';

const GET_USER_COMMUNITIES = gql`
  query Communities {
    communities {
      _id
      name
      hasNotifications
    }
  }
`;

const GET_NOTIFICATIONS = gql`
  query GetNotifications($communityId: ID!) {
    notifications(communityId: $communityId) {
      _id
      ofType
      booking {
        _id
        status
        dateType
        dateNeed
        dateReturn
        post {
          _id
          title
          image
        }
        booker {
          _id
        }
      }
      post {
        _id
        creator {
          _id
          name
        }
      }
      participants {
        _id
        name
        image
      }
      isRead
      community {
        _id
      }
      messages {
        _id
        text
      }
    }
    tokenPayload @client
  }
`;

const UPDATE_BOOKING = gql`
  mutation UpdateBooking($bookingInput: BookingInput!) {
    updateBooking(bookingInput: $bookingInput) {
      _id
      status
    }
  }
`;

function Notifications({ history, communityId }) {
  const client = useApolloClient();
  const { loading, error, data } = useQuery(GET_NOTIFICATIONS, {
    variables: { communityId },
    fetchPolicy: 'network-only',
    onCompleted: () => {
      try {
        // Get communities from cache
        const { communities } = client.readQuery({
          query: GET_USER_COMMUNITIES,
        });

        // Create new communities array with the current
        // community's hasNotifications is set to false
        const newCommunities = communities.map((community) => {
          if (community._id === communityId) {
            return { ...community, hasNotifications: false };
          }
          return community;
        });

        // Write new communities array to cache
        client.writeQuery({
          query: GET_USER_COMMUNITIES,
          data: { communities: newCommunities },
        });
        // eslint-disable-next-line
      } catch (err) {}
    },
  });

  // Update booking status by changing booking status int
  // 0: pending
  // 1: accepted
  // 2: declined
  const [
    updateBooking,
    {
      loading: { mutationLoading },
    },
  ] = useMutation(UPDATE_BOOKING, {
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="notifications-control">
      {data.notifications.length ? (
        <>
          {data.notifications.map((notification) => (
            <div
              key={notification._id}
              className="notification-item"
              role="presentation"
              onClick={() => {
                history.push(`/notification/${notification._id}`);
              }}
            >
              {notification.ofType === 0 ? (
                <>
                  <div className="left-img">
                    <div
                      className={`noti-img-border ${
                        notification.isRead[data.tokenPayload.userId]
                          ? undefined
                          : 'unread'
                      }
                      `}
                    >
                      <div
                        className="noti-img"
                        style={{
                          backgroundImage: `url(${
                            JSON.parse(notification.participants[0].image)
                              .secure_url
                          })`,
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
                          Send a message to {notification.participants[0].name}{' '}
                          now
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : notification.ofType === 1 ? (
                <>
                  <div className="left-img">
                    <div
                      className={`noti-img-border ${
                        notification.isRead[data.tokenPayload.userId]
                          ? undefined
                          : 'unread'
                      }
                  `}
                    >
                      <div
                        className="noti-img"
                        style={{
                          backgroundImage: `url(${
                            JSON.parse(notification.booking.post.image)
                              .secure_url
                          })`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="item-info">
                    <div className="item-status">
                      {notification.booking.booker._id ===
                      data.tokenPayload.userId ? (
                        <p className="title">
                          You requested {notification.participants[0].name}
                          &apos;s {notification.booking.post.title}
                        </p>
                      ) : (
                        <p className="title">
                          {notification.participants[0].name} requested your{' '}
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
                            'DD.MM.Y',
                          )}{' '}
                          -{' '}
                          {moment(+notification.booking.dateReturn).format(
                            'DD.MM.Y',
                          )}
                        </span>
                      )}
                    </div>
                    <div className="item-btns">
                      {notification.booking.booker._id ===
                      data.tokenPayload.userId ? (
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
                                        bookingId: notification.booking._id,
                                        communityId,
                                        notificationId: notification._id,
                                        notifyContent: `${data.tokenPayload.userName} has accepted your booking on ${notification.booking.post.title}`,
                                        notifyRecipientId:
                                          notification.booking.booker._id,
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
                                        bookingId: notification.booking._id,
                                        communityId,
                                        notificationId: notification._id,
                                        notifyContent: `${data.tokenPayload.userName} has denied your booking on ${notification.booking.post.title}`,
                                        notifyRecipientId:
                                          notification.booking.booker._id,
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
                        notification.isRead[data.tokenPayload.userId]
                          ? undefined
                          : 'unread'
                      }
                  `}
                    >
                      <div
                        className="noti-img"
                        style={{
                          backgroundImage: `url(${
                            JSON.parse(notification.participants[0].image)
                              .secure_url
                          })`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="item-info">
                    <div className="item-status">
                      <p className="title">
                        {notification.post.creator.name} uploaded a item for
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
          @import './src/assets/scss/index.scss';

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

Notifications.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  communityId: PropTypes.string.isRequired,
};

export { GET_NOTIFICATIONS, Notifications };
