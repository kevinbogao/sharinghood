import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
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
        <div className="info-imgs">
          {data.community.members
            .filter((member) => member._id === data.tokenPayload.userId)
            .map((member) => (
              <img
                className="user"
                key={member._id}
                src={JSON.parse(member.image).secure_url}
                alt="Your profile"
              />
            ))}
          <img
            className="recipient"
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
                    <button type="button" className="status bronze">
                      Pending
                    </button>
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
                    className="red"
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
        {data.notification.onType === 2 && (
          <>
            <p>You - {data.notification.participants[0].name}</p>
          </>
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
        <div className="chat-input">
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
          <FontAwesomeIcon
            className="send-icon"
            icon={faPaperPlane}
            type="submit"
            onClick={() => {
              if (text !== '') {
                createMessage({
                  variables: {
                    messageInput: { notificationId: match.params.id, text },
                  },
                });
              }
            }}
          />
        </div>
      </div>
      {mutationError && <p>Error :( Please try again</p>}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .notification-details-control {
            display: flex;
            flex-direction: column;

            p {
              margin: auto 10px;
              display: block;
              font-size: 16px;
              color: $bronze-200;
            }

            span {
              margin: auto 10px;
              display: block;
              font-size: 14px;
            }

            img {
              position: relative;
              top: 25%;
              height: 45px;
              width: 45px;
              border-radius: 50%;
              box-shadow: 1px 1px 1px 1px #eeeeee;

              &.recipient {
                left: -7%;
              }
            }

            button {
              margin: auto 5px;
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

            .notification-info {
              display: flex;
              justify-content: center;
              width: 100vw;
              height: 95px;
              background: #faf7f5;

              .info-imgs {
                height: 100%;
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
            }

            .notification-chat {
              flex: 1 1 0%;
              flex-direction: column;
              display: flex;
              overflow-y: scroll;

              .chat-content {
                flex: 1 1 0%;
                margin: auto 25px;
                overflow-y: auto;
                padding-top: 10px;
                padding-bottom: 10px;

                .received {
                  p {
                    font-size: 17px;
                    margin: 5px auto;
                    padding: 7px 15px;
                    clear: both;
                    float: left;
                    line-height: 1.3;
                    max-width: 230px;
                    color: #000000;
                    background: #f1f0f0;
                    border-radius: 20px;
                  }
                }

                .send {
                  p {
                    font-size: 17px;
                    margin: 5px auto;
                    padding: 7px 15px;
                    clear: both;
                    float: right;
                    line-height: 1.3;
                    max-width: 230px;
                    color: #ffffff;
                    background: $green-100;
                    border-radius: 20px;
                  }
                }
              }

              .chat-input {
                width: 100%;
                height: 60px;
                background: #f3efed;
                display: flex;
                align-items: center;
                justify-content: center;

                input {
                  height: 14px;
                  width: 68vw;
                  border-width: 0;
                  padding: 10px;
                  color: #a0998f;
                  background: $grey-100;
                  font-size: 15px;
                  border-radius: 18px;
                }
              }
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          .send-icon {
            margin-left: 20px;
            color: $green-100;
            font-size: 20px;

            &:hover {
              cursor: pointer;
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
