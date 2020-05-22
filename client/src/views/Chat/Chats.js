import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ChatDetails from './ChatDetails';
import CreateChat from './CreateChat';
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
    userId @client
    community @client {
      members {
        _id
        name
        picture
      }
    }
  }
`;

function Chats() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { loading, error, data } = useQuery(GET_CHATS, {
    onCompleted: ({ chats }) => {
      // Select first chat if chats is not empty
      if (chats.length) {
        setSelectedChat(chats[0]._id);
        setSelectedUser(chats[0].participants[0]._id);
      }
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
    <div className="chats-control">
      <div className="chats-sidebar">
        {data &&
          data.chats.map((chat) => (
            <div
              key={chat._id}
              role="presentation"
              className={`chats-icon ${
                chat.participants[0]._id === selectedUser && 'active'
              }`}
              onClick={() => {
                setSelectedChat(chat._id);
                setSelectedUser(chat.participants[0]._id);
              }}
            >
              <img src={chat.participants[0].picture} alt="Community member" />
              {chat.participants[0]._id === selectedUser ? (
                <p>{chat.participants[0].name}</p>
              ) : (
                <span className="members-tooltip">
                  {chat.participants[0].name}
                </span>
              )}
            </div>
          ))}
        <div
          role="presentation"
          className={`chats-icon ${!selectedChat && 'active'}`}
          onClick={() => {
            if (selectedChat && selectedUser) {
              setSelectedChat(null);
              setSelectedUser(null);
            } else {
              setSelectedChat(data.chats[0]._id);
              setSelectedUser(data.chats[0].participants[0]._id);
            }
          }}
        >
          <FontAwesomeIcon
            className={`plus-icon ${!selectedUser && 'expanded'}`}
            icon={faPlus}
            type="submit"
          />
        </div>
      </div>
      <div className="chats-main">
        {selectedChat ? (
          <ChatDetails chatId={selectedChat} />
        ) : (
          <CreateChat
            userId={data.userId}
            chats={data.chats}
            community={data.community}
            setSelectedChat={setSelectedChat}
            setSelectedUser={setSelectedUser}
          />
        )}
      </div>
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .chats-control {
            width: 100vw;
            display: flex;

            .chats-sidebar {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 65px;
              background: #f1f0f0;

              .chats-icon {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                padding: 10px;

                &.active {
                  background: $background;
                }

                p {
                  margin: 2px 0 0 0;
                  color: $bronze-200;
                  font-size: 14px;
                  text-align: center;
                }

                img {
                  margin-left: 11px;
                  margin: auto;
                  height: 45px;
                  width: 45px;
                  border-radius: 50%;

                  &:hover {
                    cursor: pointer;
                  }
                }

                .members-tooltip {
                  visibility: hidden;
                  width: 120px;
                  background-color: $brown;
                  color: white;
                  text-align: center;
                  border-radius: 6px;
                  padding: 5px 0;
                  position: absolute;
                  z-index: 9000 !important;
                  margin-top: 10px;
                  margin-left: 10px;
                }

                .chats-icon:hover .members-tooltip {
                  visibility: visible;
                }
              }
            }

            .chats-main {
              flex: 1 1 0%;
              display: flex;
              flex-direction: column;
              overflow-y: hidden;
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          .plus-icon {
            padding: 12px 13px;
            color: #fff;
            background: $green-100;
            font-size: 19px;
            border-radius: 50%;
            transition: all 150ms linear;

            &:hover {
              cursor: pointer;
            }

            &.expanded {
              -webkit-transform: rotate(45deg);
              -moz-transform: rotate(45deg);
              -o-transform: rotate(45deg);
              -ms-transform: rotate(45deg);
              transform: rotate(45deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Chats;
