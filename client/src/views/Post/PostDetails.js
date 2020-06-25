import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble,
  faCheck,
  faExclamationTriangle,
  faGifts,
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import Threads from '../../components/Threads';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import ItemDetails from '../../components/ItemDetails';
import { GET_POSTS } from './Posts';

const CONDITIONS = ['New', 'Used but good', 'Used but little damaged'];
const CONDITION_ICONS = [faCheckDouble, faCheck, faExclamationTriangle];
const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '20px 50px 230px 50px',
  },
};

const GET_COMMUNITY_ID = gql`
  query {
    selCommunityId @client
  }
`;

const GET_POST = gql`
  query Post($postId: ID!) {
    post(postId: $postId) {
      _id
      title
      desc
      image
      condition
      isGiveaway
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

const DELETE_POST = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId) {
      _id
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($bookingInput: BookingInput!) {
    createBooking(bookingInput: $bookingInput) {
      _id
      dateNeed
      dateReturn
      status
      booker {
        _id
      }
      patcher {
        _id
      }
    }
  }
`;

function PostDetails({ match, history }) {
  const [comment, setComment] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [dateNeed, setDateNeed] = useState(new Date());
  const [dateReturn, setDateReturn] = useState(new Date());
  const {
    data: { selCommunityId },
  } = useQuery(GET_COMMUNITY_ID);
  const { loading, error, data } = useQuery(GET_POST, {
    skip: !selCommunityId,
    variables: { postId: match.params.id, communityId: selCommunityId },
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
      const { post } = cache.readQuery({
        query: GET_POST,
        variables: { postId: data.post._id },
      });
      cache.writeQuery({
        query: GET_POST,
        data: {
          post: {
            ...post,
            threads: [...post.threads, createThread],
          },
        },
      });
    },
  });
  const [deletePost] = useMutation(DELETE_POST, {
    onError: ({ message }) => {
      console.log(message);
    },
    update(store, { data: { deletePost } }) {
      const { posts } = store.readQuery({ query: GET_POSTS });
      store.writeQuery({
        query: GET_POSTS,
        data: {
          posts: posts.filter((post) => post._id !== deletePost._id),
        },
      });
      history.push('/find');
    },
  });
  const [createBooking, { loading: mutationLoading }] = useMutation(
    CREATE_BOOKING,
    {
      onCompleted: () => {
        history.push('/bookings');
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : data.post ? (
    <div className="item-control">
      <ItemDetails item={data.post} userId={data.tokenPayload.userId}>
        <div className="item-desc">
          <h3>{data.post.title}</h3>
          <p className="prev-p">{data.post.desc}</p>
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
          {data.post.creator._id === data.tokenPayload.userId ? (
            <button
              type="button"
              className="item-btn delete"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete
            </button>
          ) : (
            <button
              type="button"
              className="item-btn book"
              onClick={() => setIsBookingOpen(true)}
            >
              Book
            </button>
          )}
        </div>
      </ItemDetails>
      <Modal
        isOpen={isDeleteOpen}
        style={MODAL_STYLE}
        onRequestClose={() => setIsDeleteOpen(false)}
      >
        <p className="modal-p">Are you sure you want to delete this post?</p>
        <button
          type="submit"
          className="modal-btn"
          onClick={(e) => {
            e.preventDefault();
            deletePost({
              variables: {
                postId: data.post._id,
              },
            });
          }}
        >
          Yes
        </button>
        <button
          type="button"
          className="modal-btn"
          onClick={() => setIsDeleteOpen(false)}
        >
          No
        </button>
      </Modal>
      <Modal
        isOpen={isBookingOpen}
        style={MODAL_STYLE}
        onRequestClose={() => setIsBookingOpen(false)}
      >
        <p className="modal-p">By when do you need it?</p>
        <DatePicker
          className="prev-input date"
          selected={dateNeed}
          onChange={(date) => setDateNeed(date)}
          dateFormat="yyyy.MM.dd"
          minDate={new Date()}
        />
        <p className="modal-p">When would like to return it?</p>
        <DatePicker
          className="prev-input date"
          selected={dateReturn}
          onChange={(date) => setDateReturn(date)}
          dateFormat="yyyy.MM.dd"
          minDate={dateNeed}
        />
        <button
          type="submit"
          className="prev-btn block"
          onClick={(e) => {
            e.preventDefault();
            createBooking({
              variables: {
                bookingInput: {
                  dateNeed,
                  dateReturn,
                  status: 0,
                  postId: data.post._id,
                  ownerId: data.post.creator._id,
                },
              },
            });
          }}
        >
          Confirm
        </button>
      </Modal>
      {mutationLoading && <Loading isCover />}
      <Threads threads={data.post.threads} members={data.community.members} />
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
                            isPost: true,
                            parentId: data.post._id,
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
                margin: 0;
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

Modal.setAppElement('#root');

PostDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default PostDetails;
