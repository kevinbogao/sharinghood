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
                {notification.booking.booker._id === tokenPayload.userId ? (
                  <p>
                    You requested {notification.participants[0].name}&apos;{' '}
                    {notification.booking.post.title}
                  </p>
                ) : (
                  <p>
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
                    {moment(+notification.booking.dateNeed).format('DD.MM.Y')} -{' '}
                    {moment(+notification.booking.dateReturn).format('DD.MM.Y')}
                  </span>
                )}
                <div className="item-btns">
                  {notification.booking.booker._id === tokenPayload.userId ? (
                    <>
                      {notification.booking.status === 0 ? (
                        <p>Pending</p>
                      ) : notification.booking.status === 0 ? (
                        <p>Accepted</p>
                      ) : (
                        <p>Denied</p>
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
              <div>
                <p>{notification.participants[0].name}</p>
              </div>
            </>
          )}
        </div>
      ))}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .notification-item-control {
            display: flex;

            &:hover {
              cursor: pointer;
              background: #f4f4f4;
            }

            img {
              height: 90px;
              width: 90px;
              border-radius: 50%;
              box-shadow: 1px 1px 1px 1px #eeeeee;
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
