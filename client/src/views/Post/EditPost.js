import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import Modal from 'react-modal';
import Spinner from '../../components/Spinner';
import { GET_POSTS } from './Posts';

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
      }
    }
    communities {
      _id
      name
      posts {
        _id
      }
    }
    tokenPayload @client
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($postInput: PostInput!) {
    updatePost(postInput: $postInput) {
      _id
      title
      image
      condition
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

const ADD_POST_TO_COMMUNITY = gql`
  mutation AddPostToCommunity($postId: ID!, $communityId: ID!) {
    addPostToCommunity(postId: $postId, communityId: $communityId) {
      _id
    }
  }
`;

function EditPost({ history, match }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [condition, setCondition] = useState('');
  const [communityArr, setCommunityArr] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { loading, error, data } = useQuery(GET_POST, {
    variables: { postId: match.params.id },
    onCompleted: ({ post, communities, tokenPayload }) => {
      // Redirect user back to post details page if user is not post creator
      if (post.creator._id !== tokenPayload.userId) {
        history.replace(`/shared/${post._id}`);
      }

      // Create a list of communities where the post is not present in
      const remainCommunities = communities.filter(
        (community) =>
          !community.posts.some((post) => post._id === match.params.id),
      );
      setCommunityArr(remainCommunities);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Add post to selected community
  const [addPostToCommunity] = useMutation(ADD_POST_TO_COMMUNITY, {
    update(cache, { data: { addPostToCommunity } }) {
      try {
        // Get posts by community id, if posts exist, add selected post to the
        // posts array
        const { posts } = cache.readQuery({
          query: GET_POSTS,
          variables: { communityId: addPostToCommunity._id },
        });

        // Create a post object with selected fields
        const postSel = (({ _id, __typename, title, image, creator }) => ({
          _id,
          __typename,
          title,
          image,
          creator,
        }))(data.post);

        // Add post to the posts array in cache
        cache.writeQuery({
          query: GET_POSTS,
          variables: { communityId: addPostToCommunity._id },
          data: { posts: [postSel, ...posts] },
        });
        // eslint-disable-next-line
      } catch (err) {}

      // Add post to select community's posts array in cache
      const { communities } = cache.readQuery({
        query: GET_POST,
        variables: { postId: match.params.id },
      });

      // Construct new communities array of community objects with
      // new post pushed to the posts array in the selected community
      const newCommunities = communities.map((community) => {
        if (community._id === addPostToCommunity._id) {
          return {
            ...community,
            posts: [
              ...community.posts,
              { __typename: 'Post', _id: data.post._id },
            ],
          };
        }
        return community;
      });

      // Write newCommunities array to cache
      cache.writeQuery({
        query: GET_POST,
        variables: { postId: match.params.id },
        data: { communities: newCommunities },
      });

      // Remove the added community from communityArr
      setCommunityArr(
        communityArr.filter(
          (community) => community._id !== addPostToCommunity._id,
        ),
      );
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Update post mutation & redirect user to home
  const [updatePost, { loading: mutationLoading }] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      history.goBack();
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Delete user's post
  const [deletePost] = useMutation(DELETE_POST, {
    update(cache, { data: { deletePost } }) {
      try {
        // Delete post from all communities in cache
        data.communities.forEach((community) => {
          // Get post by community id from cache
          const { posts } = cache.readQuery({
            query: GET_POSTS,
            variables: { communityId: community._id },
          });

          // Remove the post from posts array
          cache.writeQuery({
            query: GET_POSTS,
            variables: { communityId: community._id },
            data: {
              posts: posts.filter((post) => post._id !== deletePost._id),
            },
          });
        });
        // eslint-disable-next-line
      } catch (err) {}

      // Redirect to posts page on complete
      history.push('/find');
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="edit-post-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Redirect to post details page if no changes were made
          if (!title && !desc && !image && !condition) {
            history.goBack();
          } else {
            updatePost({
              variables: {
                postInput: {
                  postId: match.params.id,
                  ...(title && { title }),
                  ...(desc && { desc }),
                  ...(image && { image }),
                  ...(condition && {
                    condition: +condition || data.post.condition,
                  }),
                },
              },
            });
          }
        }}
      >
        <div className="image-upload">
          <label htmlFor="file-input">
            <img
              alt="profile pic"
              src={image || JSON.parse(data.post.image).secure_url}
            />
          </label>
          <input
            id="file-input"
            className="FileInput"
            type="file"
            onChange={(e) => {
              const reader = new FileReader();
              reader.readAsDataURL(e.target.files[0]);
              reader.onload = () => {
                setImage(reader.result);
              };
            }}
          />
        </div>
        <p className="main-p">Title</p>
        <input
          className="main-input"
          defaultValue={data.post.title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="main-p">Description</p>
        <input
          className="main-input"
          defaultValue={data.post.desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <p className="main-p">Condition: </p>
        <select
          className="main-select"
          value={+condition || data.post.condition}
          name="condition"
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="0">New</option>
          <option value="1">Used but good</option>
          <option value="2">Used but little damaged</option>
        </select>
        <button
          className="login-btn"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
        >
          Share this item in another community
        </button>
        <button className="main-btn block" type="submit">
          Save
        </button>
        <button
          className="main-btn block grey bottom"
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Delete
        </button>
      </form>
      <Modal
        className="react-modal"
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
        }}
      >
        {communityArr.length ? (
          <p className="modal-p">Add {data.post.title} to community</p>
        ) : (
          <p className="modal-p">
            You have shared {data.post.title} in all your communities
          </p>
        )}
        {communityArr.map((community) => (
          <button
            key={community._id}
            type="submit"
            className="main-btn modal beige"
            onClick={(e) => {
              e.preventDefault();
              addPostToCommunity({
                variables: {
                  postId: match.params.id,
                  communityId: community._id,
                },
              });
            }}
          >
            {community.name}
          </button>
        ))}
        <button
          type="button"
          className="main-btn modal grey"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          Close
        </button>
      </Modal>
      <Modal
        className="react-modal"
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
      >
        <p className="modal-p">Are you sure you want to delete this post?</p>
        <button
          type="submit"
          className="main-btn modal"
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
          className="main-btn modal grey"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          No
        </button>
      </Modal>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .edit-post-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            .image-upload > input {
              display: none;
            }

            label[for='file-input'] > img {
              cursor: pointer;
              margin-top: 30px;
              border-radius: 4px;
              width: 148px;
              height: 180px;
              object-fit: contain;
              box-shadow: 1px 1px 1px 1px #eeeeee;
            }

            h2 {
              margin: 20px auto;
              font-size: 20xp;
            }

            .profile-pic-p {
              margin: 15px auto 0px auto;
              font-size: 14px;
              max-width: 300px;
            }

            .main-input {
              margin-top: 5px;
            }

            .main-p {
              margin: 20px auto 10px auto;
            }

            .login-btn {
              display: block;
              margin: 15px auto auto auto;
              padding: 0;
              border: none;
              font-size: 17px;
              color: $beige;
              text-align: center;
              background: $background;
              text-decoration: underline;

              &:hover {
                cursor: pointer;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

EditPost.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditPost;
