import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import Modal from 'react-modal';
import Loading from './Loading';

const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '30px',
    minWidth: '300px',
  },
};

const INACTIVATE_POST = gql`
  mutation InactivatePost($postId: ID!) {
    inactivatePost(postId: $postId)
  }
`;

function UserPosts({ posts, history }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selPost, setSelPost] = useState(null);
  const [inactivatePost, { loading: mutationLoading }] = useMutation(
    INACTIVATE_POST,
    {
      onCompleted: () => {
        // TODO: remove from local state if exists
        setIsModalOpen(false);
        setSelPost(null);
      },
    },
  );

  return (
    <>
      <div className="user-posts-title">
        <p className="prev-p bronze">Items you shared</p>
        <button type="button" onClick={() => setIsEditing(!isEditing)}>
          Edit
        </button>
      </div>
      <div className="user-posts">
        {posts.map((post) => (
          // eslint-disable-next-line
          <div key={post._id} className="post-instance">
            <img
              className={isEditing ? 'editing' : undefined}
              src={JSON.parse(post.image).secure_url}
              alt=""
            />
            <p>{post.title}</p>
            <div className={`post-img-btn ${isEditing ? 'active' : undefined}`}>
              <button
                className="post-btn"
                type="button"
                onClick={() => {
                  history.push(`/shared/${post._id}/edit`);
                }}
              >
                Edit
              </button>
              <button
                className="post-btn"
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSelPost(post);
                }}
              >
                Set inactive
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        style={MODAL_STYLE}
        onRequestClose={() => {
          setIsModalOpen(false);
          setSelPost(null);
        }}
      >
        <p className="modal-p">
          Are you sure you want remove this post from all communities?
        </p>
        <button
          type="submit"
          className="modal-btn"
          onClick={(e) => {
            e.preventDefault();
            inactivatePost({
              variables: { postId: selPost._id },
            });
          }}
        >
          Yes
        </button>
        <button
          type="button"
          className="modal-btn"
          onClick={() => {
            setIsModalOpen(false);
            setSelPost(null);
          }}
        >
          No
        </button>
      </Modal>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .prev-p {
            margin: 20px 10px 20px 0px;
            max-width: 300px;

            &.bronze {
              color: $bronze-200;
            }
          }

          .user-posts-title {
            display: flex;

            button {
              border: none;
            }
          }

          .user-posts {
            max-width: 300px;
            overflow-x: scroll;
            display: flex;

            .post-instance {
              position: relative;

              p {
                margin: auto;
                font-size: 15px;
                color: $bronze-200;
                text-align: center;
              }

              .post-img-btn {
                display: none;

                &.active {
                  top: 40px;
                  left: 40px;
                  display: flex;
                  position: absolute;
                  flex-direction: column;
                }

                button {
                  padding: 5px;
                  margin: 5px auto;
                  border: none;
                  color: #fff;
                  background: #000;
                }
              }

              img {
                margin: 0 5px 0 0;
                width: 160px;
                height: 136px;
                object-fit: cover;

                &.editing {
                  -webkit-filter: grayscale(100%);
                  filter: grayscale(100%);
                }
              }
            }
          }
        `}
      </style>
    </>
  );
}

UserPosts.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    }),
  ).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserPosts;
