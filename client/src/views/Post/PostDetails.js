import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble,
  faCheck,
  faExclamationTriangle,
  faGifts,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Modal from 'react-modal';
import DatePicker from '../../components/DatePicker';
import Threads from '../../components/Threads';
import Spinner from '../../components/Spinner';
import NotFound from '../../components/NotFound';
import ItemDetails from '../../components/ItemDetails';

const CONDITIONS = ['New', 'Used but good', 'Used but little damaged'];
const CONDITION_ICONS = [faCheckDouble, faCheck, faExclamationTriangle];

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
        community {
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
      community {
        _id
      }
    }
  }
`;

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($notificationInput: NotificationInput) {
    createNotification(notificationInput: $notificationInput) {
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
      participants {
        _id
        name
        image
      }
      isRead
      messages {
        _id
        text
      }
    }
  }
`;

function PostDetails({ communityId, match, history }) {
  const [comment, setComment] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [dateType, setDateType] = useState(0);
  const [dateNeed, setDateNeed] = useState(moment());
  const [dateReturn, setDateReturn] = useState(moment());
  const { loading, error, data } = useQuery(GET_POST, {
    variables: { postId: match.params.id, communityId },
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
        variables: { postId: data.post._id, communityId },
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

  // Create a new booking notification for user and owner
  const [createNotification, { loading: mutationLoading }] = useMutation(
    CREATE_NOTIFICATION,
    {
      onCompleted: ({ createNotification }) => {
        // Redirect user to chat on mutation complete
        history.push(`/notification/${createNotification._id}`);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  // Set isMobile boolean value based on window width
  useEffect(() => {
    // Set isMobile on init
    setIsMobile(window.matchMedia('(max-width: 576px)').matches);

    // Set isMobile on screen size
    function handleWindowResize() {
      setIsMobile(window.matchMedia('(max-width: 576px)').matches);
    }

    // Event listener for screen resizing
    window.addEventListener('resize', handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return loading ? (
    <Spinner />
  ) : error ? (
    `Error! ${error.message}`
  ) : data.post ? (
    <div className="item-control">
      <ItemDetails
        item={data.post}
        history={history}
        userId={data.tokenPayload.userId}
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
          {data.post.creator._id === data.tokenPayload.userId ? (
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
        <p className="main-p">When do you need the item?</p>
        <select name="dateType" onChange={(e) => setDateType(+e.target.value)}>
          <option value="0">As soon as possible</option>
          <option value="1">No timeframe</option>
          <option value="2">Select timeframe</option>
        </select>
        {dateType === 2 && (
          <>
            <p className="main-p">By when do you need it?</p>
            <DatePicker
              isVertical
              isMobile={isMobile}
              dateNeed={dateNeed}
              dateReturn={dateReturn}
              setDateNeed={setDateNeed}
              setDateReturn={setDateReturn}
            />
          </>
        )}
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
          .filter((member) => member._id === data.tokenPayload.userId)
          .map((member) => (
            <Fragment key={member._id}>
              <img src={JSON.parse(member.image).secure_url} alt="" />
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
                    if (keyCode === 13 && comment !== '') {
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
          @import './src/assets/scss/index.scss';

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
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

          select {
            font-size: 18px;
            padding-left: 10px;
            color: #a0998f;
            width: 300px;
            height: 40px;
            border-width: 0px;
            background: $grey-000;
            border-radius: 4px;
            margin-bottom: 12px;
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

export default PostDetails;
