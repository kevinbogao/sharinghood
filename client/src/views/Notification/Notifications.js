import React from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
import moment from 'moment';
import Loading from '../../components/Loading';
import { GET_COMMUNITY } from '../../components/Navbar';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      _id
      onType
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
      participants {
        _id
        name
        image
      }
      isRead
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
    onCompleted: () => {
      // Mutate hasNotifications stats to false to remove notification red dot
      client.writeQuery({
        query: GET_COMMUNITY,
        variables: { communityId },
        data: {
          ...data,
          hasNotifications: false,
        },
      });
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
    onCompleted: (data) => {
      console.log(data);
    },
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
      {data.notifications.map((notification) => (
        <div
          key={notification._id}
          className="notification-item"
          role="presentation"
          onClick={() => history.push(`/notification/${notification._id}`)}
        >
          {notification.onType === 0 && (
            <>
              <img
                className={`${
                  notification.isRead[data.tokenPayload.userId]
                    ? undefined
                    : 'unread'
                }`}
                src={JSON.parse(notification.booking.post.image).secure_url}
                alt=""
              />
              <div className="item-info">
                <div className="item-status">
                  {notification.booking.booker._id ===
                  data.tokenPayload.userId ? (
                    <p className="title">
                      You requested {notification.participants[0].name}&apos;{' '}
                      {notification.booking.post.title}
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
                      {moment(+notification.booking.dateNeed).format('DD.MM.Y')}{' '}
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
          )}
          {notification.onType === 2 && (
            <>
              <img
                className={`${
                  notification.isRead[data.tokenPayload.userId]
                    ? undefined
                    : 'unread'
                }`}
                src={JSON.parse(notification.participants[0].image).secure_url}
                alt=""
              />
              <div className="message-info">
                <div className="message-user">
                  <p className="title name">
                    {notification.participants[0].name}
                  </p>
                </div>
                <div className="message-text">
                  {notification.messages.length && (
                    <p className="text">
                      {
                        notification.messages[notification.messages.length - 1]
                          .text
                      }
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
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
              background: #faf7f5;
              width: 320px;

              &:hover {
                cursor: pointer;
                background: #f3efed;
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
                box-shadow: 1px 1px 1px 1px #eeeeee;

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
