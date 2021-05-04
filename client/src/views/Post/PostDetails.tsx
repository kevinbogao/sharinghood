// @ts-nocheck

import { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckDouble,
  faCheck,
  faExclamationTriangle,
  faGifts,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Modal from "react-modal";
import DatePicker from "../../components/DatePicker";
import Threads from "../../components/Threads";
import Spinner from "../../components/Spinner";
import NotFound from "../../components/NotFound";
import ItemDetails from "../../components/ItemDetails";
import ServerError from "../../components/ServerError";
import { queries, mutations } from "../../utils/gql";
import { tokenPayloadVar } from "../../utils/cache";
import { transformImgUrl } from "../../utils/helpers";

const CONDITIONS = ["New", "Used but good", "Used but little damaged"];
const CONDITION_ICONS = [faCheckDouble, faCheck, faExclamationTriangle];

export default function PostDetails({ communityId, match, history }) {
  const [comment, setComment] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [dateType, setDateType] = useState(0);
  const [dateNeed, setDateNeed] = useState(moment());
  const [dateReturn, setDateReturn] = useState(moment());
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const { loading, error, data } = useQuery(queries.GET_POST_DETAILS, {
    variables: { postId: match.params.id, communityId },
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [createThread] = useMutation(mutations.CREATE_THREAD, {
    onCompleted: () => {
      setComment("");
    },
    onError: ({ message }) => {
      console.log(message);
    },
    update(cache, { data: { createThread } }) {
      const { post } = cache.readQuery({
        query: queries.GET_POST_DETAILS,
        variables: { postId: data.post._id, communityId },
      });
      cache.writeQuery({
        query: queries.GET_POST_DETAILS,
        data: {
          post: {
            ...post,
            threads: [...post.threads, createThread],
          },
        },
      });
    },
  });

  // Create a new booking notification for user and owner
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

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : data?.post ? (
    <div className="item-control">
      <ItemDetails
        item={data.post}
        history={history}
        userId={tokenPayload.userId}
        communityId={communityId}
      >
        <div className="item-desc">
          <h3>{data.post.title}</h3>
          <p className="main-p">{data.post.desc}</p>
          <div className="item-misc">
            <FontAwesomeIcon
              className="item-icon"
              icon={CONDITION_ICONS[data.post.condition]}
            />
            <span>{CONDITIONS[data.post.condition]}</span>
          </div>
          {data.post.isGiveaway && (
            <div className="item-misc">
              <FontAwesomeIcon className="item-icon" icon={faGifts} />
              <span>This is a give away</span>
            </div>
          )}
          {data.post.creator._id === tokenPayload.userId ? (
            <button
              type="button"
              className="main-btn item"
              onClick={() => history.push(`/shared/${match.params.id}/edit`)}
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              className="main-btn item"
              onClick={() => setIsBookingOpen(true)}
            >
              Book
            </button>
          )}
        </div>
      </ItemDetails>
      <Modal
        className="react-modal"
        isOpen={isBookingOpen}
        onRequestClose={() => setIsBookingOpen(false)}
      >
        <DatePicker
          dateType={dateType}
          dateNeed={dateNeed}
          dateReturn={dateReturn}
          setDateType={setDateType}
          setDateNeed={setDateNeed}
          setDateReturn={setDateReturn}
        />
        <button
          className="main-btn modal"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            createNotification({
              variables: {
                notificationInput: {
                  bookingInput: {
                    postId: match.params.id,
                    dateType,
                    status: 0,
                    ...(dateType === 2 && { dateNeed, dateReturn }),
                  },
                  ofType: 1,
                  recipientId: data.post.creator._id,
                  communityId,
                },
              },
            });
          }}
        >
          Borrow item
        </button>
        <button
          className="main-btn modal grey"
          type="button"
          onClick={() => setIsBookingOpen(false)}
        >
          Close
        </button>
      </Modal>
      {mutationLoading && <Spinner isCover />}
      <Threads
        threads={data.post.threads}
        members={data.community.members}
        communityId={communityId}
      />
      <div className="new-thread-control">
        {data.community.members
          .filter((member) => member._id === tokenPayload.userId)
          .map((member) => (
            <Fragment key={member._id}>
              <img
                src={transformImgUrl(JSON.parse(member.image).secure_url, 200)}
                alt=""
              />
              <div className="new-thread-content">
                <span className="main-p">{member.name}</span>
                <input
                  type="text"
                  className="main-input"
                  placeholder="Comment something..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyUp={(e) => {
                    const keyCode = e.keyCode || e.which;
                    if (keyCode === 13 && comment !== "") {
                      createThread({
                        variables: {
                          threadInput: {
                            content: comment,
                            isPost: true,
                            parentId: data.post._id,
                            communityId,
                            recipientId: data.post.creator._id,
                          },
                        },
                      });
                    }
                  }}
                />
              </div>
            </Fragment>
          ))}
      </div>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .item-control {
            margin: 30px auto;
            width: 80vw;
            max-width: $xl-max-width;

            .main-p {
              margin-left: 0;
            }

            .item-desc {
              margin: 0 20px 0 40px;

              h3 {
                font-size: 26px;
                color: $black;
                margin: 0;
              }

              @include lg {
                margin: 0 0 0 40px;
              }

              @include md {
                margin: 20px 0 0 30px;
              }

              @include sm {
                margin: 20px 0 0 0;
                width: 100%;
              }

              .item-misc {
                display: flex;
                align-items: center;
                margin: 5px 0;

                span {
                  margin-left: 10px;
                  color: $grey-300;
                  font-size: 18px;
                }
              }
            }
          }

          .new-thread-control {
            display: flex;
            align-items: center;
            margin-bottom: 30px;

            img {
              margin: 20px 20px 20px 0;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              object-fit: fill;
            }

            .new-thread-content {
              width: 100%;
              display: flex;
              flex-direction: column;

              .main-p {
                margin: initial;
                margin-top: 16px;
                color: $black;
              }

              .main-input {
                height: initial;
                width: initial;
                max-width: initial;
                margin: 20px 0;
                font-size: 16px;
                height: 10px;
                flex: 2;
              }
            }
          }
        `}
      </style>
    </div>
  ) : (
    <NotFound itemType="Item" />
  );
}

Modal.setAppElement("#root");

PostDetails.propTypes = {
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
