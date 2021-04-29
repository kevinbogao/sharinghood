import { useState } from "react";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";
import InlineError from "../../components/InlineError";
import uploadImg from "../../assets/images/upload.png";
import Spinner from "../../components/Spinner";
import { queries, mutations } from "../../utils/gql";
import { validateForm } from "../../utils/helpers";

export default function CreatePost({ communityId, history, location }) {
  let title, desc, isGiveaway;
  const [image, setImage] = useState(null);
  const [condition, setCondition] = useState(0);
  const [error, setError] = useState({});
  const [createPost, { loading: mutationLoading }] = useMutation(
    mutations.CREATE_POST,
    {
      update(cache, { data: { createPost } }) {
        // Fetch posts from cache
        const data = cache.readQuery({
          query: queries.GET_POSTS,
          variables: { communityId },
        });

        // Update cached posts if it exists
        if (data) {
          cache.writeQuery({
            query: queries.GET_POSTS,
            variables: { communityId },
            data: { posts: [createPost, ...data.posts] },
          });
        }
        history.push("/find");
      },
      onError: () => {
        setError({
          res:
            "We are experiencing difficulties right now :( Please try again later",
        });
      },
    }
  );

  return (
    <div className="share-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm({ title, desc, image }, setError);
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
          <p className="main-p">
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
          className="main-input"
          name="title"
          placeholder="Title"
          ref={(node) => (title = node)}
        />
        {error.title && <InlineError text={error.title} />}
        <input
          className="main-input"
          name="desc"
          placeholder="Description"
          ref={(node) => (desc = node)}
        />
        {error.desc && <InlineError text={error.desc} />}
        {error.descExists && <InlineError text={error.descExists} />}
        <p className="main-p">Condition: </p>
        <select
          className="main-select"
          name="condition"
          onChange={(e) => setCondition(e.target.value)}
        >
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
          <p className="main-p checkbox">
            This is a giveaway! (People can borrow it for an indefinite time)
          </p>
        </div>
        {error.res && <InlineError text={error.res} />}
        <button className="main-btn block" type="submit">
          Share
        </button>
      </form>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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

            .main-btn {
              margin: 20px 0 30px 0;
            }

            .giveaway {
              display: flex;

              input {
                margin: 5px 10px auto auto;

                &.checkbox {
                  margin: 20px 10px 0 0;
                }
              }

              .main-p {
                max-width: 280px;
                font-size: 19px;
                margin: 0;

                &.checkbox {
                  margin: 14px 0;
                  font-size: 16px;
                }

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
  }).isRequired,
};
