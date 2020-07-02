import React from 'react';
import PropTypes from 'prop-types';
// import { gql, useMutation } from '@apollo/client';
import moment from 'moment';

function NotificationItem({ history, notifications, tokenPayload }) {
  console.log(tokenPayload);
  return (
    <>
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className="notification-item-control"
          role="presentation"
          onClick={() => history.push(`/notifications/${notification._id}`)}
        >
          {notification.onType === 0 && (
            <>
              <img
                src={JSON.parse(notification.booking.post.image).secure_url}
                alt=""
              />
              <div className="item-info">
                <div className="item-status">
                  {notification.booking.booker._id === tokenPayload.userId ? (
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
                  {notification.booking.booker._id === tokenPayload.userId ? (
                    <>
                      {notification.booking.status === 0 ? (
                        <button type="button" className="status bronze">
                          Pending
                        </button>
                      ) : notification.booking.status === 0 ? (
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="red"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {notification.onType === 2 && (
            <>
              <img
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
                  <p className="text">
                    {
                      notification.messages[notification.messages.length - 1]
                        .text
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .notification-item-control {
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
              border-color: #fc5e06;
              border-style: solid;
              box-shadow: 1px 1px 1px 1px #eeeeee;

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
        `}
      </style>
    </>
  );
}

NotificationItem.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      booking: PropTypes.shape({
        post: PropTypes.shape({
          title: PropTypes.string.isRequired,
          image: PropTypes.string.isRequired,
        }),
        booker: PropTypes.shape({
          _id: PropTypes.string.isRequired,
        }),
        dateNeed: PropTypes.string,
      }),
    }),
  ).isRequired,
  tokenPayload: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
};

export default NotificationItem;
