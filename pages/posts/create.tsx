import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";
import ImageInput from "../../components/ImageInput";
import { Container, Loader, InlineError } from "../../components/Container";
import { types } from "../../lib/types";
import { ItemCondition } from "../../lib/types";
import { queries, mutations } from "../../lib/gql";
import { communityIdVar } from "../_app";

interface PostInputs {
  image?: string;
  title: string;
  desc: string;
  condition: ItemCondition;
  isGiveaway: boolean;
  res?: any;
}

export default function CreatePost() {
  const router = useRouter();
  const methods = useForm<PostInputs>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = methods;
  const [image, setImage] = useState<string | undefined>(undefined);
  const [createPost, { loading: mutationLoading }] = useMutation<
    types.CreatePostData,
    types.CreatePostVars
  >(mutations.CREATE_POST, {
    update(cache, { data }) {
      const communityId = communityIdVar()!;
      const postsCache = cache.readQuery<types.PostsData, types.PostsVars>({
        query: queries.GET_POSTS,
        variables: { communityId },
      });
      if (data && postsCache) {
        cache.writeQuery<types.PostsData, types.PostsVars>({
          query: queries.GET_POSTS,
          variables: { communityId },
          data: { posts: [data.createPost, ...postsCache.posts] },
        });
      }
      router.push("/posts");
    },
    onError() {
      setError("res", {
        message:
          "We are experiencing difficulties right now :( Please try again later",
      });
    },
  });

  return (
    <Container>
      <div className="share-control">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) => {
              if (Object.keys(errors).length === 0 && image) {
                createPost({
                  variables: {
                    postInput: {
                      title: data.title,
                      desc: data.desc,
                      image,
                      condition: data.condition,
                      isGiveaway: data.isGiveaway,
                      ...(router.query?.requesterId && {
                        requesterId: router.query.requesterId.toString(),
                      }),
                    },
                    communityId: communityIdVar()!,
                  },
                });
              }
            })}
          >
            {router.query?.requesterName && (
              <p className="main-p">
                {router.query.requesterName} will be notified when you post this
                item for their request
              </p>
            )}
            <ImageInput type="item" image={image} setImage={setImage} />
            {errors.image && <InlineError text={errors.image.message!} />}
            <input
              className="main-input"
              placeholder="Title"
              {...register("title", { required: "Please enter a title" })}
            />
            {errors.title && <InlineError text={errors.title.message!} />}
            <input
              className="main-input"
              placeholder="Description"
              {...register("desc", { required: "Please enter a description" })}
            />
            {errors.desc && <InlineError text={errors.desc.message!} />}
            <p className="main-p">Condition: </p>
            <select className="main-select" {...register("condition")}>
              <option value={ItemCondition.NEW}>New</option>
              <option value={ItemCondition.USED}>Used but good</option>
              <option value={ItemCondition.DAMAGED}>
                Used but little damaged
              </option>
            </select>
            <div className="main-checkbox">
              <input type="checkbox" {...register("isGiveaway")} />
              <p>
                This is a giveaway! (People can borrow it for an indefinite
                time)
              </p>
            </div>
            {errors.res && <InlineError text={errors.res.message!} />}
            <button className="main-btn" type="submit">
              {mutationLoading ? <Loader /> : "Share"}
            </button>
          </form>
        </FormProvider>
        <style jsx>
          {`
            @import "../index.scss";

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
            }
          `}
        </style>
      </div>
    </Container>
  );
}
