import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Loading from '../../components/Loading';

const GET_CHAT = gql`
  query getChat($chatId: ID!) {
    chat(chatId: $chatId) {
      messages {
        _id
        text
        sender {
          _id
        }
        createdAt
      }
    }
    userId @client
  }
`;

const MESSAGES_SUBSCRIPTION = gql`
  subscription onNewChatMessage($chatId: ID!) {
    newChatMessage(chatId: $chatId) {
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

function ChatDetails({ chatId }) {
  const [text, setText] = useState('');
  const { subscribeToMore, loading, error, data } = useQuery(GET_CHAT, {
    fetchPolicy: 'cache-and-network',
    skip: !chatId,
    variables: { chatId },
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
    },
  );

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGES_SUBSCRIPTION,
      variables: { chatId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newFeedItem = subscriptionData.data.newChatMessage;
        return {
          ...prev,
          chat: {
            messages: [...prev.chat.messages, newFeedItem],
          },
        };
      },
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, [chatId]);

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : (
    <>
      <div className="chat-content">
        {data &&
          data.chat.messages.map((message) => (
            <div
              key={message._id}
              className={
                message.sender._id === data.userId ? 'send' : 'received'
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
                  messageInput: { chatId, text },
                },
              });
            }
          }}
        />
        <FontAwesomeIcon
          className="sent-icon"
          icon={faPaperPlane}
          type="submit"
          onClick={() => {
            if (text !== '') {
              createMessage({
                variables: {
                  messageInput: { chatId, text },
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

          .chat-content {
            flex: 1 1 0%;
            overflow-y: auto;
            padding: 10px 50px;

            @include md {
              padding: 10px 25px;
            }

            .received {
              p {
                font-size: 17px;
                margin: 5px auto;
                padding: 7px 15px;
                clear: both;
                float: left;
                width: max-content;
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
                width: max-content;
                color: #ffffff;
                background: $green-100;
                border-radius: 20px;
              }
            }
          }

          .chat-input {
            height: 60px;
            width: 100%;
            background: #f3efed;
            display: flex;
            justify-content: center;
            align-items: center;

            input {
              height: 14px;
              width: calc(100vw - 200px);
              border-width: 0;
              padding: 10px;
              color: #a0998f;
              background: $grey-100;
              font-size: 15px;
              border-radius: 18px;
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          .sent-icon {
            margin-left: 25px;
            color: $green-100;
            font-size: 20px;

            &:hover {
              cursor: pointer;
            }
          }
        `}
      </style>
    </>
  );
}

ChatDetails.propTypes = {
  chatId: PropTypes.string.isRequired,
};

export default ChatDetails;
