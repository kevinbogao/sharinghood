// @ts-nocheck
import { useState } from "react";
import PropTypes from "prop-types";
import { useLazyQuery, useMutation, useApolloClient } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";
import Spinner from "./Spinner";
import { queries, mutations } from "../utils/gql";
import { transformImgUrl } from "../utils/helpers";

export default function ItemDetails({
  history,
  item,
  userId,
  communityId,
  children,
}) {
  const client = useApolloClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [findNotification] = useLazyQuery(queries.FIND_NOTIFICATION, {
    onCompleted: ({ findNotification }) => {
      // Redirect user to chat if chat (notification) exists, else
      // open the send message modal for the user to create a new notification
      if (findNotification)
        history.push(`/notification/${findNotification._id}`);
      else setIsModalOpen(true);
    },
  });

  // Create chat related notification
  const [createNotification, { loading: mutationLoading }] = useMutation(
    mutations.CREATE_NOTIFICATION,
    {
      onCompleted: ({ createNotification }) => {
        // Redirect user to chat on mutation complete
        history.push(`/notification/${createNotification._id}`);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    }
  );

  return (
    <>
      <div className="item-content">
        <div className="item-info">
          <div className="item-img">
            <img
              src={transformImgUrl(JSON.parse(item.image).secure_url, 700)}
              alt=""
            />
          </div>
          {children}
        </div>
        <div className="item-creator">
          <div
            className="creator-img"
            style={{
              backgroundImage: `url(${transformImgUrl(
                JSON.parse(item.creator.image).secure_url,
                500
              )})`,
            }}
          />
          <div className="creator-info">
            <p className="main-p name">{item.creator.name}</p>
            <h6>Find me: {item.creator.apartment}</h6>
            <p>
              Member since{" "}
              <span className="join-date">
                {moment(+item.creator.createdAt).format("MMM DD")}
              </span>
            </p>
            {item.creator._id !== userId && (
              <button
                className="msg-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  findNotification({
                    variables: {
                      recipientId: item.creator._id,
                      communityId,
                    },
                  });
                }}
                onMouseOver={() => {
                  client.query({
                    query: queries.FIND_NOTIFICATION,
                    variables: {
                      recipientId: item.creator._id,
                      communityId,
                    },
                  });
                }}
              >
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="item-separator" />
      <Modal
        className="react-modal"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <p className="main-p">
          Would you like to sent a message to {item.creator.name} ?
        </p>
        <button
          className="main-btn modal"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            createNotification({
              variables: {
                notificationInput: {
                  ofType: 0,
                  recipientId: item.creator._id,
                  communityId,
                },
              },
            });
          }}
        >
          Yes
        </button>
        <button
          className="main-btn modal grey"
          type="button"
          onClick={() => setIsModalOpen(false)}
        >
          Close
        </button>
      </Modal>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .item-content {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;

            .msg-btn {
              color: $background;
              background: $beige;
              padding: 5px 12px;
              border: none;
              border-radius: 15px;
              font-size: 15px;
            }

            @include lg {
              flex-direction: column;
            }

            .item-info {
              display: flex;
              justify-content: flex-start;
              align-items: center;

              @include lg {
                justify-content: space-between;
              }

              @include sm {
                flex-direction: column;
              }

              .item-img {
                img {
                  max-height: 290px;
                  max-width: 320px;

                  @include md {
                    max-height: 227px;
                    max-width: 250px;
                  }

                  @include sm {
                    max-width: 80vw;
                  }
                }
              }
            }

            .item-creator {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0px 0px 6px $white;

              @include lg {
                margin-top: 20px;
                flex-direction: row;
                justify-content: start;
              }

              .creator-img {
                margin: 10px;
                width: 140px;
                height: 140px;
                background-size: cover;
                background-position: center;
                border-radius: 50%;

                @include lg {
                  width: 110px;
                  height: 110px;
                }

                @include sm {
                  width: 90px;
                  height: 90px;
                  padding-right: 0;
                  margin: 10px 0px 10px 10px;
                }
              }

              .creator-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                overflow-wrap: break-word;
                text-align: center;

                @include lg {
                  width: 70%;
                }

                @include sm {
                  padding: 10px 10px 10px 0px;
                }

                p {
                  color: $grey-300;
                  margin: 7px 0;
                  max-width: 150px;

                  @include lg {
                    max-width: initial;
                  }

                  &.name {
                    color: $black;
                    font-weight: bold;
                  }
                }

                h6 {
                  font-size: 16px;
                  color: $grey-300;
                  max-width: 150px;
                }
              }
            }
          }

          .item-separator {
            width: 100%;
            height: 2px;
            background: #f2f2f2bb;
          }
        `}
      </style>
      <style jsx global>
        {`
          @import "./src/assets/scss/index.scss";

          .item-icon {
            color: $grey-300;
            font-size: 18px;
          }
        `}
      </style>
    </>
  );
}

ItemDetails.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  item: PropTypes.shape({
    image: PropTypes.string.isRequired,
    creator: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      apartment: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  communityId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
