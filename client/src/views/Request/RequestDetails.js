import { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUserClock } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import Spinner from "../../components/Spinner";
import Threads from "../../components/Threads";
import NotFound from "../../components/NotFound";
import ItemDetails from "../../components/ItemDetails";
import ServerError from "../../components/ServerError";
import { queries, mutations } from "../../utils/gql";
import { tokenPayloadVar } from "../../utils/cache";
import { transformImgUrl } from "../../utils/helpers";

export default function RequestDetails({ communityId, match, history }) {
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tokenPayload = useReactiveVar(tokenPayloadVar);

  // Get request details
  const { loading, error, data } = useQuery(queries.GET_REQUEST_DETAILS, {
    variables: { requestId: match.params.id, communityId },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Create a thread to request for current user in current community
  const [createThread] = useMutation(mutations.CREATE_THREAD, {
    onCompleted: () => {
      setComment("");
    },
    onError: ({ message }) => {
      console.log(message);
    },
    update(cache, { data: { createThread } }) {
      try {
        const { request } = cache.readQuery({
          query: queries.GET_REQUEST_DETAILS,
          variables: { requestId: data.request._id, communityId },
        });
        cache.writeQuery({
          query: queries.GET_REQUEST_DETAILS,
          data: {
            request: {
              ...request,
              threads: [...request.threads, createThread],
            },
          },
        });
        // eslint-disable-next-line
      } catch (err) {}
    },
  });

  // Delete request if user is request creator
  const [deleteRequest, { loading: mutationLoading }] = useMutation(
    mutations.DELETE_REQUEST,
    {
      onError: ({ message }) => {
        console.log(message);
      },
      update(cache, { data: { deleteRequest } }) {
        const { requests } = cache.readQuery({
          query: queries.GET_REQUESTS,
          variables: { communityId },
        });
        cache.writeQuery({
          query: queries.GET_REQUESTS,
          variables: { communityId },
          data: {
            requests: requests.filter(
              (request) => request._id !== deleteRequest._id
            ),
          },
        });
        history.push("/requests");
      },
    }
  );

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : data?.request ? (
    <div className="item-control">
      <ItemDetails
        item={data.request}
        history={history}
        userId={tokenPayload.userId}
        communityId={communityId}
      >
        <div className="item-desc">
          <h3>{data.request.title}</h3>
          <p className="main-p">{data.request.desc}</p>
          {data.request.dateType === 0 ? (
            <div className="item-misc">
              <FontAwesomeIcon className="item-icon" icon={faClock} />
              <span>As soon as possible</span>
            </div>
          ) : data.request.dateType === 1 ? (
            <div className="item-misc">
              <FontAwesomeIcon className="item-icon" icon={faClock} />
              <span>No timeframe</span>
            </div>
          ) : (
            <>
              <div className="item-misc">
                <FontAwesomeIcon className="item-icon" icon={faClock} />
                <span>
                  Date Needed: {moment(+data.request.dateNeed).format("MMM DD")}
                </span>
              </div>
              <div className="item-misc">
                <FontAwesomeIcon className="item-icon" icon={faUserClock} />
                <span>
                  Needed until:{" "}
                  {moment(+data.request.dateReturn).format("MMM DD")}
                </span>
              </div>
            </>
          )}
          {data.request.creator._id === tokenPayload.userId ? (
            <button
              type="button"
              className="main-btn item"
              onClick={() => setIsModalOpen(true)}
            >
              Delete
            </button>
          ) : (
            <Link
              to={{
                pathname: "/share",
                state: {
                  requesterId: data.request.creator._id,
                  requesterName: data.request.creator.name,
                },
              }}
            >
              <button type="button" className="main-btn item">
                Help {data.request.creator.name}
              </button>
            </Link>
          )}
        </div>
      </ItemDetails>
      <Modal
        className="react-modal"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <p className="main-p">Are you sure you want to delete this request?</p>
        <button
          type="submit"
          className="main-btn modal"
          onClick={(e) => {
            e.preventDefault();
            deleteRequest({
              variables: {
                requestId: data.request._id,
              },
            });
          }}
        >
          Yes
        </button>
        <button
          type="button"
          className="main-btn modal grey"
          onClick={() => setIsModalOpen(false)}
        >
          No
        </button>
      </Modal>
      {mutationLoading && <Spinner isCover />}
      <Threads
        threads={data.request.threads}
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
                            isPost: false,
                            parentId: data.request._id,
                            communityId,
                            recipientId: data.request.creator._id,
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
                margin: 0 0 20px 0;
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
                max-width: initial;
                width: initial;
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
    <NotFound itemType="Request" />
  );
}

RequestDetails.propTypes = {
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
