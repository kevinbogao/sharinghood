import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
import moment from 'moment';
import Loading from '../../components/Loading';
import { GET_COMMUNITY } from '../../components/Navbar';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
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
  mutation UpdateBooking($bookingId: ID!, $bookingInput: BookingInput!) {
    updateBooking(bookingId: $bookingId, bookingInput: $bookingInput) {
      _id
      status
    }
  }
`;

function Notifications({ history, communityId }) {
  const client = useApolloClient();
  const { loading, error, data } = useQuery(GET_NOTIFICATIONS, {
    // Use useCallback to prevent fetchPolicy's infinite requests
    // TODO: wait for package fix
    // fetchPolicy: 'network-only',
    fetchPolicy: 'cache-and-network',
    onCompleted: useCallback(() => {
      // Mutate hasNotifications stats to false to remove notification red dot
      client.writeQuery({
        query: GET_COMMUNITY,
        variables: { communityId },
        data: {
          ...data,
          hasNotifications: false,
        },
      });
      // eslint-disable-next-line
    }, []),
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
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="notifications-control">
      {data.notifications.length ? (
        <>
          {data.notifications
            .filter(
              (notification) => notification.community._id === communityId,
            )
            .map((notification) => (
              <div
                key={notification._id}
                className="notification-item"
                role="presentation"
                onClick={() =>
                  history.push(`/notification/${notification._id}`)
                }
              >
                {notification.ofType === 0 ? (
                  <>
                    <img
                      className={`${
                        notification.isRead[data.tokenPayload.userId]
                          ? undefined
                          : 'unread'
                      }`}
                      src={
                        JSON.parse(notification.participants[0].image)
                          .secure_url
                      }
                      alt=""
                    />
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
                            Send a message to{' '}
                            {notification.participants[0].name} now
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : notification.ofType === 1 ? (
                  <>
                    <img
                      className={`${
                        notification.isRead[data.tokenPayload.userId]
                          ? undefined
                          : 'unread'
                      }`}
                      src={
                        JSON.parse(notification.booking.post.image).secure_url
                      }
                      alt=""
                    />
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
                              <button type="button" className="status bronze">
                                Pending
                              </button>
                            ) : notification.booking.status === 1 ? (
                              <button type="button" className="status green">
                                Accepted
                              </button>
                            ) : (
                              <button type="button" className="status red">
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateBooking({
                                      variables: {
                                        bookingId: notification.booking._id,
                                        bookingInput: {
                                          status: 1,
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
                                  className="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateBooking({
                                      variables: {
                                        bookingId: notification.booking._id,
                                        bookingInput: {
                                          status: 2,
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
                              <button type="button" className="status green">
                                Accepted
                              </button>
                            ) : (
                              <button type="button" className="status red">
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
                    <img
                      className={`${
                        notification.isRead[data.tokenPayload.userId]
                          ? undefined
                          : 'unread'
                      }`}
                      src={
                        JSON.parse(notification.participants[0].image)
                          .secure_url
                      }
                      alt=""
                    />
                    <div className="item-info">
                      <div className="item-status">
                        <p className="title">
                          {notification.post.creator.name} uploaded a item for
                          your request!
                        </p>
                      </div>
                      <div className="item-btns">
                        <button type="button" className="status brown">
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
        <p className="prev-p">You do not have any notifications yet</p>
      )}
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .notifications-control {
            margin: 30px auto;

            @include sm {
              margin: 15px auto 30px auto;
            }

            .notification-item {
              margin: 15px;
              display: flex;
              // background: rgba(220, 216, 208, 0.2);
              background: #f8f8f8;
              width: 320px;

              &:hover {
                cursor: pointer;
                // background: #f3efed;
                background: $grey-hover;
              }

              p {
                &.title {
                  margin: auto 10px;
                  display: block;
                  font-size: 16px;
                  color: $bronze-200;

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

              img {
                height: 90px;
                width: 90px;
                margin: 10px;
                border-width: 3px;
                border-radius: 50%;
                border-color: transparent;
                border-style: solid;
                // box-shadow: 1px 1px 1px 1px #eeeeee;

                &.unread {
                  border-color: #fc5e06;
                  border-style: solid;
                }

                @include sm {
                  height: 80px;
                  width: 80px;
                }
              }

              button {
                border: none;
                color: $background;
                background: $green-200;
                font-size: 17px;
                width: 85px;
                height: 30px;
                border-radius: 15px;

                &:hover {
                  color: #fff;
                  background: $green-100;
                }

                &.red {
                  background: $red-200;

                  &:hover {
                    color: #fff;
                    background: $red-100;
                  }
                }

                &.status {
                  color: $background;
                  width: 160px;

                  &.bronze {
                    background: $bronze-200;
                  }

                  &.brown {
                    background: $brown;
                  }

                  &.green {
                    background: $green-200;
                  }

                  &.red {
                    background: $red-200;
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
