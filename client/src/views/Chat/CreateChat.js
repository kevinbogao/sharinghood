import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import Loading from '../../components/Loading';

const GET_CHATS = gql`
  query Chats {
    chats {
      _id
      participants {
        _id
        name
        picture
      }
      updatedAt
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($recipientId: ID!) {
    createChat(recipientId: $recipientId) {
      _id
      participants {
        _id
        name
        picture
      }
      updatedAt
    }
  }
`;

function CreateChat({
  userId,
  chats,
  community,
  setSelectedChat,
  setSelectedUser,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [recipientId, setRecipientId] = useState(null);
  const [
    createChat,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(CREATE_CHAT, {
    onError: ({ message }) => {
      console.log(message);
    },
    update(cache, { data: { createChat } }) {
      const { chats } = cache.readQuery({
        query: GET_CHATS,
      });
      cache.writeQuery({
        query: GET_CHATS,
        data: { chats: [createChat, ...chats] },
      });
      setSelectedChat(createChat._id);
      setSelectedUser(createChat.participants[0]._id);
    },
  });

  return (
    <>
      {isCreating ? (
        <div className="create-chat">
          <div className="create-chat-content">
            <p>Would you like to sent a message?</p>
            <div className="create-chat-btn">
              <button
                type="button"
                onClick={() => {
                  createChat({
                    variables: { recipientId },
                  });
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                }}
              >
                No
              </button>
            </div>
          </div>
          {mutationLoading && <Loading />}
          {mutationError && <p>Error :( Please try again</p>}
        </div>
      ) : (
        <div className="members-list">
          {community.members
            .filter((member) => member._id !== userId)
            .map((member) => (
              <div
                role="presentation"
                className="member-container"
                key={member._id}
                onClick={() => {
                  const chat = chats.find(
                    (chat) => chat.participants[0]._id === member._id,
                  );
                  if (chat) {
                    setSelectedChat(chat._id);
                    setSelectedUser(member._id);
                  } else {
                    setIsCreating(true);
                    setRecipientId(member._id);
                  }
                }}
              >
                <img src={member.picture} alt="" />
                <p>{member.name}</p>
              </div>
            ))}
        </div>
      )}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .create-chat {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            p {
              font-size: 18px;
              margin: 20px 0;
            }

            .create-chat-btn {
              display: flex;
              justify-content: space-evenly;

              button {
                padding: 7px 15px;
                background-color: $green-200;
                font-size: 16px;
                font-weight: 600;
                color: $background;
                border: none;
                border-radius: 10px;

                &:hover {
                  cursor: pointer;
                  background: $green-100;
                }
              }
            }
          }

          .members-list {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 20px;
            padding-bottom: 20px;

            .member-container {
              display: flex;
              padding: 5px;
              margin: 5px;
              align-items: center;
              background: $grey-100;
              width: 70%;

              &:hover {
                background: #f1f0f0;
              }

              img {
                margin-left: 11px;
                margin-right: 11px;
                height: 45px;
                width: 45px;
                border-radius: 50%;

                &:hover {
                  cursor: pointer;
                }
              }

              p {
                flex: 1 1 0%;
              }
            }
          }
        `}
      </style>
    </>
  );
}

CreateChat.propTypes = {
  userId: PropTypes.string.isRequired,
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      participants: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
        }),
      ),
    }),
  ).isRequired,
  community: PropTypes.shape({
    members: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        picture: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  setSelectedChat: PropTypes.func.isRequired,
  setSelectedUser: PropTypes.func.isRequired,
};

export default CreateChat;
