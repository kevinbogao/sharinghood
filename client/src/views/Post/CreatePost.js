import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation } from '@apollo/client';
import InlineError from '../../components/InlineError';
import uploadImg from '../../assets/images/upload.png';
import Loading from '../../components/Loading';
import { GET_POSTS } from './Posts';

const CREATE_POST = gql`
  mutation CreatePost($postInput: PostInput!, $communityId: ID) {
    createPost(postInput: $postInput, communityId: $communityId) {
      _id
      title
      desc
      image
      creator {
        _id
        name
      }
    }
  }
`;

function CreatePost({ communityId, history, location }) {
  let title, desc, isGiveaway;
  const [image, setImage] = useState(null);
  const [condition, setCondition] = useState(0);
  const [error, setError] = useState({});
  const [
    createPost,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(CREATE_POST, {
    update(cache, { data: { createPost } }) {
      // Try catch block to avoid empty requests cache error
      try {
        const { posts } = cache.readQuery({
          query: GET_POSTS,
          variables: { communityId },
        });
        cache.writeQuery({
          query: GET_POSTS,
          variables: { communityId },
          data: { posts: posts.concat([createPost]) },
        });
      } catch (err) {
        console.log(err);
      }
      history.push('/find');
    },
  });

  function validate() {
    const errors = {};
    if (!title.value) errors.title = 'Please enter a title';
    if (!desc.value) errors.desc = 'Please enter a description';
    if (!image) errors.image = 'Please upload a picture of the item';
    setError(errors);
    return errors;
  }

  return (
    <div className="share-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            createPost({
              variables: {
                postInput: {
                  title: title.value,
                  desc: desc.value,
                  image,
                  condition: +condition,
                  isGiveaway: isGiveaway.checked,
                  ...(location.state && {
                    requesterId: location.state.requesterId,
                  }),
                },
                communityId,
              },
            });
          }
        }}
      >
        {location.state && (
          <p className="prev-p">
            {location.state.requesterName} will be notified when you post the
            item for their request
          </p>
        )}
        <div className="image-upload">
          <label htmlFor="file-input">
            <img alt="profile pic" src={image || uploadImg} />
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
        {error.image && <InlineError text={error.image} />}
        <input
          className="prev-input"
          name="title"
          placeholder="Title"
          ref={(node) => (title = node)}
        />
        {error.title && <InlineError text={error.title} />}
        <input
          className="prev-input"
          name="desc"
          placeholder="Description"
          ref={(node) => (desc = node)}
        />
        {error.desc && <InlineError text={error.desc} />}
        {error.descExists && <InlineError text={error.descExists} />}
        <p className="prev-p">Condition: </p>
        <select name="condition" onChange={(e) => setCondition(e.target.value)}>
          <option value="0">New</option>
          <option value="1">Used but good</option>
          <option value="2">Used but little damaged</option>
        </select>
        <div className="giveaway">
          <input
            className="checkbox"
            type="checkbox"
            ref={(node) => (isGiveaway = node)}
          />
          <p className="prev-p">
            This is a giveaway! (People can borrow it for an indefinite time)
          </p>
        </div>
        <button className="prev-btn" type="submit">
          Share
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      {mutationError && <p>Error :( Please try again</p>}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .share-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80vw;

            @include sm {
              max-width: 300px;
            }

            .image-upload > input {
              display: none;
            }

            img {
              margin-top: 30px;
              border-radius: 4px;
              width: 148px;
              height: 180px;
              object-fit: contain;
              box-shadow: 1px 1px 1px 1px #eeeeee;
            }

            .prev-p {
              max-width: 280px;
              font-size: 19px;
              margin: 20px 0;
            }

            .prev-input {
              margin-top: 30px;
            }

            .prev-btn {
              margin: 20px 0 30px 0;
            }

            select {
              font-size: 18px;
              padding-left: 10px;
              color: $brown;
              width: 300px;
              height: 40px;
              border-width: 0px;
              background: $grey-200;
              border-radius: 4px;
              margin-bottom: 12px;

              @include sm {
                width: 100%;
              }
            }

            .giveaway {
              display: flex;

              input {
                margin: 5px 10px auto auto;
              }

              .prev-p {
                max-width: 280px;
                font-size: 19px;
                margin: 0;

                @include sm {
                  max-width: calc(100% - 20px);
                }
              }
            }
          }
        `}
      </style>
    </div>
  );
}

CreatePost.propTypes = {
  communityId: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      requesterId: PropTypes.string,
      requesterName: PropTypes.string,
    }),
  }),
};

export default CreatePost;
