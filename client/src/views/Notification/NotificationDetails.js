import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import Loading from '../../components/Loading';

const GET_NOTIFICATION = gql`
  query GetNotification($notificationId: ID!) {
    notification(notificationId: $notificationId) {
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
      messages {
        _id
        text
        sender {
          _id
        }
        createdAt
      }
    }
    tokenPayload @client
    community(communityId: $communityId) @client {
      members {
        _id
        name
        image
      }
    }
  }
`;

const MESSAGES_SUBSCRIPTION = gql`
  subscription onNewNotificationMessage($notificationId: ID!) {
    newNotificationMessage(notificationId: $notificationId) {
      _id
      text
      createdAt
      sender {
        _id
      }
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateMessage($messageInput: MessageInput!) {
    createMessage(messageInput: $messageInput) {
      _id
      text
      sender {
        _id
      }
      createdAt
    }
  }
`;

function NotificationDetails({ communityId, match }) {
  const [text, setText] = useState('');
  const { subscribeToMore, loading, error, data } = useQuery(GET_NOTIFICATION, {
    variables: { notificationId: match.params.id, communityId },
    onCompleted: (data) => {
      console.log(data);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [createMessage, { error: mutationError }] = useMutation(
    CREATE_MESSAGE,
    {
      onCompleted: () => {
        setText('');
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGES_SUBSCRIPTION,
      variables: { notificationId: match.params.id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newFeedItem = subscriptionData.data.newNotificationMessage;
        return {
          ...prev,
          notification: {
            messages: [...prev.notification.messages, newFeedItem],
          },
        };
      },
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, [match.params.id]);

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="notification-details-control">
      <div className="notification-info">
        <div className="info-img">
          {data.community.members
            .filter((member) => member._id === data.tokenPayload.userId)
            .map((member) => (
              <img
                key={member._id}
                src={JSON.parse(member.image).secure_url}
                alt="Your profile"
              />
            ))}
          <img
            src={JSON.parse(data.notification.participants[0].image).secure_url}
            alt="Booker profile"
          />
        </div>
        {data.notification.onType === 0 && (
          <div className="item-info">
            <div className="item-status">
              <p>{data.notification.booking.post.title}</p>
              {data.notification.booking.dateType === 0 ? (
                <span>As soon as possible</span>
              ) : data.notification.booking.dateType === 1 ? (
                <span>No timeframe</span>
              ) : (
                <span>
                  {moment(+data.notification.booking.dateNeed).format(
                    'DD.MM.Y',
                  )}{' '}
                  -{' '}
                  {moment(+data.notification.booking.dateReturn).format(
                    'DD.MM.Y',
                  )}
                </span>
              )}
            </div>
            <div className="item-btns">
              {data.notification.booking.booker._id ===
              data.tokenPayload.userId ? (
                <>
                  {data.notification.booking.status === 0 ? (
                    <p>Pending</p>
                  ) : data.notification.booking.status === 0 ? (
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
        )}
      </div>
      <div className="notification-chat">
        <div className="chat-content">
          {data &&
            data.notification.messages.map((message) => (
              <div
                key={message._id}
                className={
                  message.sender._id === data.tokenPayload.userId
                    ? 'send'
                    : 'received'
                }
              >
                <p>{message.text}</p>
              </div>
            ))}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyUp={(e) => {
            const keyCode = e.keyCode || e.which;
            if (keyCode === 13 && text !== '') {
              createMessage({
                variables: {
                  messageInput: { notificationId: match.params.id, text },
                },
              });
            }
          }}
        />
      </div>
      {mutationError && <p>Error :( Please try again</p>}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .notification-details-control {
            .notification-info {
              display: flex;

              .item-info {
                display: flex;
                flex-direction: column;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

NotificationDetails.propTypes = {
  communityId: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default NotificationDetails;
