import { useState } from "react";
import { Location, History } from "history";
import { useMutation } from "@apollo/client";
import Spinner from "../../components/Spinner";
import ImageInput from "../../components/ImageInput";
import InlineError from "../../components/InlineError";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { validateForm, FormError } from "../../utils/helpers";

type State = {
  requesterId?: string;
  requesterName?: string;
};

interface CreatePostProps {
  communityId: string;
  history: History;
  location: Location<State>;
}

export default function CreatePost({
  communityId,
  history,
  location,
}: CreatePostProps) {
  let title: HTMLInputElement | null;
  let desc: HTMLInputElement | null;
  let isGiveaway: HTMLInputElement | null;
  const [image, setImage] = useState<string | null>(null);
  const [condition, setCondition] = useState<number>(0);
  const [error, setError] = useState<FormError>({});
  const [createPost, { loading: mutationLoading }] = useMutation<
    typeDefs.CreatePostData,
    typeDefs.CreatePostVars
  >(mutations.CREATE_POST, {
    update(cache, { data }) {
      const postsCache = cache.readQuery<
        typeDefs.PostsData,
        typeDefs.PostsVars
      >({
        query: queries.GET_POSTS,
        variables: { communityId },
      });

      if (data && postsCache) {
        cache.writeQuery<typeDefs.PostsData, typeDefs.PostsVars>({
          query: queries.GET_POSTS,
          variables: { communityId },
          data: { posts: [data.createPost, ...postsCache.posts] },
        });
      }
      history.push("/find");
    },
    onError: () => {
      setError({
        res: "We are experiencing difficulties right now :( Please try again later",
      });
    },
  });

  return (
    <div className="share-control">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          let errors = validateForm({ title, desc }, image);
          setError(errors);
          if (Object.keys(errors).length === 0 && title && desc && image) {
            createPost({
              variables: {
                postInput: {
                  title: title.value,
                  desc: desc.value,
                  image,
                  condition: +condition,
                  isGiveaway: isGiveaway!.checked,
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
        <ImageInput image={image} setImage={setImage} isItem={true} />
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
          onChange={(e) => setCondition(+e.currentTarget.value)}
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
