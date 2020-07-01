import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      _id
      # onType
      # onDocId
      # content
      # isRead
    }
  }
`;

const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification($notificationInput: NotificationInput!) {
    updateNotification(notificationInput: $notificationInput) {
      _id
      onType
      onDocId
      content
      isRead
    }
  }
`;

function Notifications({
  unreadCount,
  setUnreadCount,
  isNotificationsOpen,
  setIsNotificationsOpen,
}) {
  const node = useRef();
  const history = useHistory();
  const { data } = useQuery(GET_NOTIFICATIONS, {
    onCompleted: ({ notifications }) => {
      let count = 0;
      for (let i = 0; i < notifications.length; i++) {
        if (!notifications[i].isRead) {
          count++;
        }
      }
      setUnreadCount(count);
    },
  });
  const [updateNotification] = useMutation(UPDATE_NOTIFICATION, {
    onCompleted: () => {
      setUnreadCount(unreadCount - 1);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  function handleClickOutside(e) {
    if (node.current.contains(e.target)) {
      return;
    }
    setIsNotificationsOpen(false);
  }

  useEffect(() => {
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line
  }, [isNotificationsOpen]);

  function notificationRedirect(onType, onDocId) {
    setIsNotificationsOpen(false);
    switch (onType) {
      case 0:
        history.push(`/shared/${onDocId}`);
        break;
      case 1:
        history.push(`/requests/${onDocId}`);
        break;
      case 2:
        history.push('/bookings');
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={node}
      className={`notifications-control ${isNotificationsOpen && 'show'}`}
    >
      {data && data.notifications.length !== 0 ? (
        data.notifications.map((notification) => (
          <p
            role="presentation"
            key={notification._id}
            className={`notification-item ${
              notification.isRead ? 'read' : 'unread'
            }`}
            onClick={() => {
              if (!notification.isRead) {
                updateNotification({
                  variables: {
                    notificationInput: {
                      notificationId: notification._id,
                      isRead: true,
                    },
                  },
                });
              }
              notificationRedirect(notification.onType, notification.onDocId);
            }}
          >
            {notification.content}
          </p>
        ))
      ) : (
        <p className="notifications-none">
          There are no notifications for you.
        </p>
      )}
      <style jsx>
        {`
          .notifications-control {
            position: absolute;
            width: 300px;
            height: 340px;
            top: 70px;
            right: 10px;
            background: #fefefe;
            box-shadow: 0px 0px 6px #f0f0f0;
            border-radius: 6px;
            overflow-y: scroll;
            display: none;
            z-index: 6000;

            &.show {
              display: block;
            }

            .notification-item {
              width: calc(100% - 24px);
              height: 36px;
              font-size: 15px;
              padding: 12px;
              margin: 0;
              cursor: pointer;
              border-bottom: 1px;
              border-bottom-width: 1px;
              border-bottom-style: solid;

              &.read {
                border-color: #f2f2f2;
                background: #fafafa;
                color: #b0a99fbb;
              }

              &.unread {
                border-color: #e7e7e7;
                background: #fdfdfd;
                color: #b0a99f;
              }

              &:hover {
                background: #eaeaea;
              }

              &:active {
                background: #eaeaea;
              }
            }

            .notifications-none {
              font-size: 14px;
              width: 100%;
              text-align: center;
              color: #b0a99f;
            }
          }
        `}
      </style>
    </div>
  );
}

Notifications.propTypes = {
  unreadCount: PropTypes.number.isRequired,
  setUnreadCount: PropTypes.func.isRequired,
  isNotificationsOpen: PropTypes.bool.isRequired,
  setIsNotificationsOpen: PropTypes.func.isRequired,
};

export default Notifications;
