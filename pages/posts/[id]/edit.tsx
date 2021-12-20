import { useState } from "react";
import { useRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import Modal from "react-modal";
import ImageInput from "../../../components/ImageInput";
import { queries, mutations } from "../../../lib/gql";
import { types, ItemCondition } from "../../../lib/types";
import { tokenPayloadVar, communityIdVar } from "../../_app";
import {
  Container,
  Spinner,
  Loader,
  InlineError,
} from "../../../components/Container";

interface PostInputs {
  image: string;
  desc: string;
  title: string;
  condition: ItemCondition;
  isGiveaway: boolean;
}

export default function EditPost() {
  const router = useRouter();
  const methods = useForm<PostInputs>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const [image, setImage] = useState<string | undefined>();
  const [communityArr, setCommunityArr] = useState<types.Community[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const communityId = useReactiveVar(communityIdVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const {
    loading,
    error,
    data: postAndCommunities,
  } = useQuery<types.PostAndCommunitiesData, types.PostAndCommunitiesVars>(
    queries.GET_POST_AND_COMMUNITIES,
    {
      skip: !router.query.id,
      variables: { postId: router.query.id?.toString()! },
      onCompleted({ post, communities }) {
        if (tokenPayload && post.creator.id !== tokenPayload.userId)
          router.replace(`/posts/${post.id}`);

        setImage(post.imageUrl);
        setCommunityArr(
          communities.filter(
            (community) =>
              !community.posts.some((post1) => post1.id === post.id)
          )
        );
      },
      onError({ message }) {
        console.log(message);
      },
    }
  );

  const [updatePost, { loading: mutationLoading }] = useMutation<
    types.UpdatePostData,
    types.UpdatePostVars
  >(mutations.UPDATE_POST, {
    update(cache, { data }) {
      const postDetailsCache = cache.readQuery<
        types.PostDetailsData,
        types.PostDetailsVars
      >({
        query: queries.GET_POST_DETAILS,
        variables: {
          postId: postAndCommunities!.post.id,
          communityId: communityId!,
        },
      });

      if (postDetailsCache && data) {
        cache.writeQuery<types.PostDetailsData, types.PostDetailsVars>({
          query: queries.GET_POST_DETAILS,
          data: {
            ...postDetailsCache,
            post: {
              ...postDetailsCache.post,
              title: data.updatePost.title,
              desc: data.updatePost.desc,
              imageUrl: data.updatePost.imageUrl,
              condition: data.updatePost.condition,
              isGiveaway: data.updatePost.isGiveaway,
            },
          },
        });
      }

      router.back();
    },
    onError({ message }) {
      console.log(message);
    },
  });

  const [deletePost, { loading: deletePostLoading }] = useMutation<
    types.DeletePostData,
    types.DeletePostVars
  >(mutations.DELETE_POST, {
    update(cache) {
      postAndCommunities?.communities.forEach((community) => {
        const postsCache = cache.readQuery<types.PostsData, types.PostsVars>({
          query: queries.GET_POSTS,
          variables: { communityId: community.id },
        });

        if (!postsCache) return;
        cache.writeQuery<types.PostsData, types.PostsVars>({
          query: queries.GET_POSTS,
          variables: { communityId: community.id },
          data: {
            posts: postsCache.posts.filter(
              (post) => post.id !== postAndCommunities.post.id
            ),
          },
        });
      });
      router.push("/posts");
    },
  });

  const [addPostToCommunity, { loading: addPostToCommunityLoading }] =
    useMutation<types.AddPostToCommunityData, types.AddPostToCommunityVars>(
      mutations.ADD_POST_TO_COMMUNITY,
      {
        update(cache, { data }) {
          const postAndCommunitiesCache = cache.readQuery<
            types.PostAndCommunitiesData,
            types.PostAndCommunitiesVars
          >({
            query: queries.GET_POST_AND_COMMUNITIES,
            variables: { postId: router.query.id?.toString()! },
          });

          const postsCache = cache.readQuery<types.PostsData, types.PostsVars>({
            variables: { communityId: data!.addPostToCommunity.id },
            query: queries.GET_POSTS,
          });

          if (postsCache && postAndCommunitiesCache) {
            cache.writeQuery<types.PostsData, types.PostsVars>({
              query: queries.GET_POSTS,
              variables: { communityId: data!.addPostToCommunity.id },
              data: {
                posts: [postAndCommunitiesCache.post, ...postsCache.posts],
              },
            });
          }

          if (postAndCommunitiesCache) {
            const newCommunities = postAndCommunitiesCache.communities.map(
              (community) => {
                if (community.id === data!.addPostToCommunity.id) {
                  return {
                    ...community,
                    posts: [
                      ...community.posts,
                      {
                        __typename: "Post",
                        id: postAndCommunitiesCache.post.id,
                      },
                    ],
                  };
                }
                return community;
              }
            );

            cache.writeQuery({
              query: queries.GET_POST_AND_COMMUNITIES,
              variables: { postId: postAndCommunitiesCache.post.id },
              data: {
                ...postAndCommunitiesCache,
                communities: newCommunities,
              },
            });
          }

          setCommunityArr(
            communityArr.filter(
              (community) => community.id !== data?.addPostToCommunity.id
            )
          );
        },
        onError({ message }) {
          console.log(message);
        },
      }
    );

  return (
    <Container loading={loading} error={error}>
      <div className="edit-post-control">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) => {
              console.log(data);

              const post = postAndCommunities?.post;
              const { desc, title, condition, isGiveaway } = data;
              if (
                post?.desc === desc &&
                post?.title == title &&
                post?.imageUrl === image &&
                post?.condition == condition &&
                post?.isGiveaway === isGiveaway
              ) {
                router.back();
              } else {
                updatePost({
                  variables: {
                    postInput: {
                      postId: post!.id,
                      ...(post?.desc !== desc && { desc }),
                      ...(post?.title !== title && { title }),
                      ...(post?.imageUrl !== image && { image }),
                      ...(post?.condition !== condition && { condition }),
                      ...(post?.isGiveaway !== isGiveaway && { isGiveaway }),
                    },
                  },
                });
              }
            })}
          >
            <ImageInput type="item" image={image} setImage={setImage} />
            <p className="main-p">Title</p>
            <input
              className="main-input"
              defaultValue={postAndCommunities?.post.title}
              {...register("title", { required: "Please enter a title" })}
            />
            {errors.title && <InlineError text={errors.title.message!} />}
            <p className="main-p">Description</p>
            <input
              className="main-input"
              defaultValue={postAndCommunities?.post.desc}
              {...register("desc", { required: "Please enter a description" })}
            />
            {errors.desc && <InlineError text={errors.desc.message!} />}
            <p className="main-p">Condition: </p>
            <select
              className="main-select"
              defaultValue={postAndCommunities?.post.condition}
              {...register("condition")}
            >
              <option value={ItemCondition.NEW}>New</option>
              <option value={ItemCondition.USED}>Used but good</option>
              <option value={ItemCondition.DAMAGED}>
                Used but little damaged
              </option>
            </select>
            <div className="main-checkbox">
              <input
                type="checkbox"
                defaultChecked={postAndCommunities?.post.isGiveaway}
                {...register("isGiveaway")}
              />
              <p>
                This is a giveaway! (People can borrow it for an indefinite
                time)
              </p>
            </div>
            <button
              className="login-btn"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
            >
              Share this item in another community
            </button>
            <button className="main-btn block" type="submit">
              {mutationLoading ? <Loader /> : "Save"}
            </button>
            <button
              className="main-btn block grey bottom"
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </button>
          </form>
        </FormProvider>
        <Modal
          className="react-modal"
          isOpen={isAddModalOpen}
          onRequestClose={() => {
            setIsAddModalOpen(false);
          }}
        >
          {communityArr.length ? (
            <p className="modal-p">
              Add {postAndCommunities?.post.title} to community
            </p>
          ) : (
            <p className="modal-p">
              You have shared {postAndCommunities?.post.title} in all your
              communities
            </p>
          )}
          {communityArr.map((community) => (
            <button
              key={community.id}
              type="submit"
              className="main-btn modal beige"
              onClick={(e) => {
                e.preventDefault();
                addPostToCommunity({
                  variables: {
                    postId: postAndCommunities!.post.id,
                    communityId: community.id,
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
                variables: { postId: postAndCommunities!.post.id },
              });
            }}
          >
            {deletePostLoading ? <Loader /> : "Yes"}
          </button>
          <button
            type="button"
            className="main-btn modal grey"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            No
          </button>
        </Modal>
        {addPostToCommunityLoading && <Spinner cover />}
        <style jsx>
          {`
            @import "../../index.scss";

            .edit-post-control {
              margin: auto;

              @include sm {
                max-width: 300px;
                width: 80vw;
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
                margin: 9px auto auto auto;
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
    </Container>
  );
}

Modal.setAppElement("#__next");
