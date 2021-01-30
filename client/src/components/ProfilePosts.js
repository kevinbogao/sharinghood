import React, { useState } from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";
import Spinner from "./Spinner";

const INACTIVATE_POST = gql`
  mutation InactivatePost($postId: ID!) {
    inactivatePost(postId: $postId)
  }
`;

function ProfilePosts({ posts, history }) {
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
      onError: ({ message }) => {
        console.log(message);
      },
    }
  );

  return (
    <>
      <div className="user-posts-title">
        <p className="main-p">Items you shared</p>
        <button
          type="button"
          className={isEditing ? "editing" : undefined}
          onClick={() => setIsEditing(!isEditing)}
        >
          Edit
        </button>
      </div>
      <div className="user-posts">
        {posts.map((post) => (
          <div key={post._id} className="post-instance">
            <div
              className={`post-img ${isEditing ? "editing" : undefined}`}
              style={{
                backgroundImage: `url(${JSON.parse(post.image).secure_url})`,
              }}
            />
            <p>{post.title}</p>
            <div className={`post-img-btn ${isEditing ? "active" : undefined}`}>
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
        className="react-modal"
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setSelPost(null);
        }}
      >
        <p className="main-p">
          Are you sure you want remove this post from all communities?
        </p>
        <button
          type="submit"
          className="main-btn modal"
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
          className="main-btn modal grey"
          onClick={() => {
            setIsModalOpen(false);
            setSelPost(null);
          }}
        >
          No
        </button>
      </Modal>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .main-p {
            margin: 20px 10px 20px 0px;
          }

          .user-posts-title {
            display: flex;
            align-items: center;

            button {
              font-size: 14px;
              border: none;
              color: $background;
              background: $orange;
              padding: 2px 7px;
              height: 27px;
              border-radius: 5px;

              &.editing {
                background: $beige;
              }
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
                color: $beige;
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

              .post-img {
                margin: 0 5px 0 0;
                width: 160px;
                height: 136px;
                background-size: cover;
                background-position: center;

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

ProfilePosts.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default ProfilePosts;
