import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUserClock } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import Loading from '../../components/Loading';
import Threads from '../../components/Threads';
import NotFound from '../../components/NotFound';
import ItemDetails from '../../components/ItemDetails';
import { GET_REQUESTS } from './Requests';

const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '20px 50px 50px 50px',
  },
};

const GET_REQUEST = gql`
  query Request($requestId: ID!) {
    request(requestId: $requestId) {
      _id
      title
      desc
      image
      dateNeed
      dateReturn
      creator {
        _id
        name
        image
        apartment
        createdAt
      }
      threads {
        _id
        content
        poster {
          _id
        }
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

const CREATE_THREAD = gql`
  mutation CreateThread($threadInput: ThreadInput!) {
    createThread(threadInput: $threadInput) {
      _id
      content
      poster {
        _id
      }
    }
  }
`;

const DELETE_REQUEST = gql`
  mutation DeleteRequest($requestId: ID!) {
    deleteRequest(requestId: $requestId) {
      _id
    }
  }
`;

function RequestDetails({ communityId, match, history }) {
  const [comment, setComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, error, data } = useQuery(GET_REQUEST, {
    variables: { requestId: match.params.id, communityId },
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [createThread] = useMutation(CREATE_THREAD, {
    onCompleted: () => {
      setComment('');
    },
    onError: ({ message }) => {
      console.log(message);
    },
    update(cache, { data: { createThread } }) {
      const { request } = cache.readQuery({
        query: GET_REQUEST,
        variables: { requestId: data.request._id, communityId },
      });
      cache.writeQuery({
        query: GET_REQUEST,
        data: {
          request: {
            ...request,
            threads: [...request.threads, createThread],
          },
        },
      });
    },
  });
  const [deleteRequest, { loading: mutationLoading }] = useMutation(
    DELETE_REQUEST,
    {
      onError: ({ message }) => {
        console.log(message);
      },
      update(store, { data: { deleteRequest } }) {
        const { requests } = store.readQuery({
          query: GET_REQUESTS,
          variables: { communityId },
        });
        store.writeQuery({
          query: GET_REQUESTS,
          variables: { communityId },
          data: {
            requests: requests.filter(
              (request) => request._id !== deleteRequest._id,
            ),
          },
        });
        history.push('/requests');
      },
    },
  );

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : data.request ? (
    <div className="item-control">
      <ItemDetails item={data.request} userId={data.tokenPayload.userId}>
        <div className="item-desc">
          <h3>{data.request.title}</h3>
          <p className="prev-p">{data.request.desc}</p>
          <div className="item-misc">
            <FontAwesomeIcon className="item-icon" icon={faClock} />
            <span>
              Date Needed: {moment(+data.request.dateNeed).format('MMM DD')}
            </span>
          </div>
          <div className="item-misc">
            <FontAwesomeIcon className="item-icon" icon={faUserClock} />
            <span>
              Needed until: {moment(+data.request.dateReturn).format('MMM DD')}
            </span>
          </div>
          {data.request.creator._id === data.tokenPayload.userId ? (
            <button
              type="button"
              className="item-btn delete"
              onClick={() => setIsModalOpen(true)}
            >
              Delete
            </button>
          ) : (
            <Link
              to={{
                pathname: '/share',
                state: {
                  creatorName: data.request.creator.name,
                },
              }}
            >
              <button type="button" className="item-btn book">
                Help {data.request.creator.name}
              </button>
            </Link>
          )}
        </div>
      </ItemDetails>
      <Modal
        isOpen={isModalOpen}
        style={MODAL_STYLE}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <p className="modal-p">Are you sure you want to delete this request?</p>
        <button
          type="submit"
          className="modal-btn"
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
          className="modal-btn"
          onClick={() => setIsModalOpen(false)}
        >
          No
        </button>
      </Modal>
      {mutationLoading && <Loading isCover />}
      <Threads
        threads={data.request.threads}
        members={data.community.members}
      />
      <div className="new-thread-control">
        {data.community.members
          .filter((member) => member._id === data.tokenPayload.userId)
          .map((member) => (
            <Fragment key={member._id}>
              <img src={JSON.parse(member.image).secure_url} alt="" />
              <div className="new-thread-content">
                <span className="prev-p">{member.name}</span>
                <input
                  type="text"
                  className="prev-input"
                  placeholder="Comment something..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyUp={(e) => {
                    const keyCode = e.keyCode || e.which;
                    if (keyCode === 13 && comment !== '') {
                      createThread({
                        variables: {
                          threadInput: {
                            content: comment,
                            isPost: false,
                            parentId: data.request._id,
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
          @import './src/assets/scss/index.scss';

          .item-control {
            margin: 30px auto;
            width: 80vw;
            max-width: $xl-max-width;

            .item-desc {
              margin: 0 20px 0 40px;

              h3 {
                font-size: 26px;
                color: $bronze-100;
                margin: 0 0 20px 0;
              }

              .prev-p {
                margin: 20px auto;
              }

              @include lg {
                margin: 0 0 0 40px;
              }

              @include md {
                margin: 20px 0 0 0;
              }

              @include sm {
                width: 100%;
              }

              .item-misc {
                display: flex;
                align-items: center;
                margin: 5px 0;

                span {
                  margin-left: 10px;
                  color: $brown;
                  font-size: 18px;
                }
              }

              .item-btn {
                &.delete {
                  background: $red-200;

                  &:hover {
                    background: $red-100;
                  }
                }

                &.book {
                  background: $bronze-200;

                  &:hover {
                    background: $bronze-100;
                  }
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

              .prev-p {
                margin-top: 16px;
                color: $bronze-200;
              }

              .prev-input {
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

export default RequestDetails;
