import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Spinner from '../../components/Spinner';

const GET_NOTIFICATION = gql`
  query GetNotification($notificationId: ID!) {
    notification(notificationId: $notificationId) {
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
      isRead
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

const UPDATE_BOOKING = gql`
  mutation UpdateBooking($bookingInput: BookingInput!) {
    updateBooking(bookingInput: $bookingInput) {
      _id
      status
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

function NotificationDetails({ communityId, match, history }) {
  const [text, setText] = useState('');
  const { subscribeToMore, loading, error, data } = useQuery(GET_NOTIFICATION, {
    fetchPolicy: 'network-only',
    variables: { notificationId: match.params.id, communityId },
    onCompleted: ({ notification }) => {
      // Redirect to post details page by id if notification type is 2 (request)
      if (notification.ofType === 2) {
        history.push(`/shared/${notification.post._id}`);
      }
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

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGES_SUBSCRIPTION,
      variables: { notificationId: match.params.id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          ...prev,
          notification: {
            messages: [
              ...prev.notification.messages,
              subscriptionData.data.newNotificationMessage,
            ],
          },
        };
      },
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, [match.params.id]);

  return loading ? (
    <Spinner />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="notification-details-control">
      <div className="notification-info">
        <div className="info-imgs">
          {data.community.members
            .filter((member) => member._id === data.tokenPayload.userId)
            .map((member) => (
              <div
                key={member._id}
                className="user-img user"
                style={{
                  backgroundImage: `url(${
                    JSON.parse(member.image).secure_url
                  })`,
                }}
              />
            ))}
          <div
            className="user-img recipient"
            style={{
              backgroundImage: `url(${
                JSON.parse(data.notification.participants[0].image).secure_url
              })`,
            }}
          />
        </div>
        {data.notification.ofType === 0 && (
          <>
            <p>You - {data.notification.participants[0].name}</p>
          </>
        )}
        {data.notification.ofType === 1 && (
          <div className="item-info">
            <div className="item-status">
              <p
                className="p-link"
                role="presentation"
                onClick={() => {
                  history.push(`/shared/${data.notification.booking.post._id}`);
                }}
              >
                {data.notification.booking.post.title}
              </p>
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
                    <button type="button" className="noti-btn status pending">
                      Pending
                    </button>
                  ) : data.notification.booking.status === 1 ? (
                    <button type="button" className="noti-btn status accept">
                      Accepted
                    </button>
                  ) : (
                    <button type="button" className="noti-btn status deny">
                      Denied
                    </button>
                  )}
                </>
              ) : (
                <>
                  {data.notification.booking.status === 0 ? (
                    <>
                      <button
                        type="button"
                        className="noti-btn accept"
                        onClick={(e) => {
                          e.preventDefault();
                          updateBooking({
                            variables: {
                              bookingInput: {
                                status: 1,
                                bookingId: data.notification.booking._id,
                                communityId,
                                notificationId: data.notification._id,
                                notifyContent: `${data.tokenPayload.userName} has accepted your booking on ${data.notification.booking.post.title}`,
                                notifyRecipientId:
                                  data.notification.booking.booker._id,
                              },
                            },
                          });
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="noti-btn deny"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          updateBooking({
                            variables: {
                              bookingInput: {
                                status: 2,
                                bookingId: data.notification.booking._id,
                                communityId,
                                notificationId: data.notification._id,
                                notifyContent: `${data.tokenPayload.userName} has denied your booking on ${data.notification.booking.post.title}`,
                                notifyRecipientId:
                                  data.notification.booking.booker._id,
                              },
                            },
                          });
                        }}
                      >
                        Deny
                      </button>
                    </>
                  ) : data.notification.booking.status === 1 ? (
                    <button type="button" className="noti-btn status accept">
                      Accepted
                    </button>
                  ) : (
                    <button type="button" className="noti-btn status deny">
                      Denied
                    </button>
                  )}
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
                    messageInput: {
                      text,
                      communityId,
                      recipientId: data.notification.participants[0]._id,
                      notificationId: match.params.id,
                    },
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
                    messageInput: {
                      text,
                      communityId,
                      recipientId: data.notification.participants[0]._id,
                      notificationId: match.params.id,
                    },
                  },
                });
              }
            }}
          />
        </div>
      </div>
      {mutationError && <p>Error :( Please try again</p>}
      {mutationLoading && <Spinner isCover />}
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

              &.p-link {
                &:hover {
                  cursor: pointer;
                }
              }
            }

            span {
              margin: auto 10px;
              display: block;
              font-size: 14px;
            }

            .noti-btn {
              margin: auto 5px;
            }

            .notification-info {
              display: flex;
              justify-content: center;
              width: 100vw;
              height: 95px;
              background: $grey-100;

              .info-imgs {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                .user-img {
                  height: 45px;
                  width: 45px;
                  border-radius: 50%;
                  background-size: cover;
                  background-position: center;

                  &.recipient {
                    position: relative;
                    left: -7%;
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
                    color: $black;
                    background: $grey-200;
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
                    color: $background;
                    background: #03ad008c;
                    border-radius: 20px;
                  }
                }
              }

              .chat-input {
                width: 100%;
                height: 60px;
                background: $grey-200;
                display: flex;
                align-items: center;
                justify-content: center;

                input {
                  height: 14px;
                  width: 68vw;
                  border-width: 0;
                  padding: 10px;
                  color: #a0998f;
                  background: $background;
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
            color: $orange;
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default NotificationDetails;
