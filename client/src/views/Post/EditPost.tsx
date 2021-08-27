import { useState } from "react";
import { History } from "history";
import { match } from "react-router-dom";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import Modal from "react-modal";
import Spinner from "../../components/Spinner";
import ServerError from "../../components/ServerError";
import ImageInput from "../../components/ImageInput";
import { queries, mutations } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";
import { tokenPayloadVar, selCommunityIdVar } from "../../utils/cache";

interface EditPostProps {
  history: History;
  match: match<{ id: string }>;
}

export default function EditPost({ history, match }: EditPostProps) {
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [condition, setCondition] = useState<string>("");
  const [isGiveaway, setIsGiveaway] = useState(false);
  const [communityArr, setCommunityArr] = useState<Array<typeDefs.Community>>(
    []
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const selCommunityId = useReactiveVar(selCommunityIdVar);
  const {
    loading,
    error,
    data: postAndCommunities,
  } = useQuery<
    typeDefs.PostAndCommunitiesData,
    typeDefs.PostAndCommunitiesVars
  >(queries.GET_POST_AND_COMMUNITIES, {
    variables: { postId: match.params.id },
    onCompleted: ({ post, communities }) => {
      // Redirect user back to post details page if user is not post creator
      if (tokenPayload && post.creator._id !== tokenPayload.userId) {
        history.replace(`/shared/${post._id}`);
      }

      // Set inGiveaway to local state
      setIsGiveaway(post.isGiveaway);

      // Create a list of communities where the post is not present in
      const remainCommunities = communities.filter(
        (community) =>
          !community.posts.some((post) => post._id === match.params.id)
      );
      setCommunityArr(remainCommunities);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Add post to selected community
  const [addPostToCommunity] = useMutation<
    typeDefs.AddPostToCommunityData,
    typeDefs.AddPostToCommunityVars
  >(mutations.ADD_POST_TO_COMMUNITY, {
    update(cache, { data }) {
      // Get posts by community id, if posts exist, add selected post to the
      // posts array
      const postsCache = cache.readQuery<
        typeDefs.PostsData,
        typeDefs.PostsVars
      >({
        query: queries.GET_POSTS,
        variables: { communityId: data!.addPostToCommunity._id },
      });

      if (postsCache) {
        cache.writeQuery<typeDefs.PostsData, typeDefs.PostsVars>({
          query: queries.GET_POSTS,
          variables: { communityId: data!.addPostToCommunity._id },
          data: { posts: [postAndCommunities!.post, ...postsCache.posts] },
        });
      }

      // Add post to select community's posts array in cache
      const postAndCommunityCache = cache.readQuery<
        typeDefs.PostAndCommunitiesData,
        typeDefs.PostAndCommunitiesVars
      >({
        query: queries.GET_POST_AND_COMMUNITIES,
        variables: { postId: match.params.id },
      });

      if (postAndCommunityCache) {
        // Construct new communities array of community objects with
        // new post pushed to the posts array in the selected community
        const newCommunities = postAndCommunityCache.communities.map(
          (community) => {
            if (community._id === data!.addPostToCommunity._id) {
              return {
                ...community,
                posts: [
                  ...community.posts,
                  { __typename: "Post", _id: postAndCommunities!.post._id },
                ],
              };
            }
            return community;
          }
        );

        // Write newCommunities array to cache
        cache.writeQuery({
          query: queries.GET_POST_AND_COMMUNITIES,
          variables: { postId: match.params.id },
          data: { communities: newCommunities },
        });
      }

      // Remove the added community from communityArr
      setCommunityArr(
        communityArr.filter(
          (community) => community._id !== data!.addPostToCommunity._id
        )
      );
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Update post mutation & redirect user to home
  const [updatePost, { loading: mutationLoading }] = useMutation<
    typeDefs.UpdatePostData,
    typeDefs.UpdatePostVars
  >(mutations.UPDATE_POST, {
    update(cache, { data }) {
      const postDetailsCache = cache.readQuery<
        typeDefs.PostDetailsData,
        typeDefs.PostDetailsVars
      >({
        query: queries.GET_POST_DETAILS,
        variables: {
          postId: postAndCommunities!.post._id,
          communityId: selCommunityId!,
        },
      });

      if (postDetailsCache) {
        cache.writeQuery<typeDefs.PostDetailsData, typeDefs.PostDetailsVars>({
          query: queries.GET_POST_DETAILS,
          data: {
            ...postDetailsCache,
            post: {
              ...postDetailsCache.post,
              title: data!.updatePost.title,
              desc: data!.updatePost.desc,
              image: data!.updatePost.image,
              condition: data!.updatePost.condition,
              isGiveaway: data!.updatePost.isGiveaway,
            },
          },
        });
      }
      history.goBack();
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Delete user's post
  const [deletePost] = useMutation<
    typeDefs.DeletePostData,
    typeDefs.DeletePostVars
  >(mutations.DELETE_POST, {
    update(cache, { data }) {
      // Delete post from all communities in cache
      postAndCommunities?.communities.forEach((community) => {
        // Get post by community id from cache
        const postsCache = cache.readQuery<
          typeDefs.PostsData,
          typeDefs.PostsVars
        >({
          query: queries.GET_POSTS,
          variables: { communityId: community._id },
        });

        if (postsCache) {
          // Remove the post from posts array
          cache.writeQuery<typeDefs.PostsData, typeDefs.PostsVars>({
            query: queries.GET_POSTS,
            variables: { communityId: community._id },
            data: {
              posts: postsCache.posts.filter(
                (post) => post._id !== data!.deletePost._id
              ),
            },
          });
        }
      });

      // Redirect to posts page on complete
      history.push("/find");
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    postAndCommunities && (
      <div className="edit-post-control">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Redirect to post details page if no changes were made
            if (
              !title &&
              !desc &&
              !image &&
              !condition &&
              postAndCommunities.post.isGiveaway === isGiveaway
            ) {
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
                      condition:
                        +condition || postAndCommunities.post.condition,
                    }),
                    ...(postAndCommunities.post.isGiveaway !== isGiveaway && {
                      isGiveaway,
                    }),
                  },
                },
              });
            }
          }}
        >
          <ImageInput
            image={
              image || JSON.parse(postAndCommunities.post.image).secure_url
            }
            setImage={setImage}
            isItem={true}
          />
          <p className="main-p">Title</p>
          <input
            className="main-input"
            onChange={(e) => setTitle(e.currentTarget.value)}
            defaultValue={postAndCommunities.post.title}
          />
          <p className="main-p">Description</p>
          <input
            className="main-input"
            onChange={(e) => setDesc(e.currentTarget.value)}
            defaultValue={postAndCommunities.post.desc}
          />
          <p className="main-p">Condition: </p>
          <select
            className="main-select"
            value={+condition || postAndCommunities.post.condition}
            onChange={(e) => setCondition(e.currentTarget.value)}
            name="condition"
          >
            <option value="0">New</option>
            <option value="1">Used but good</option>
            <option value="2">Used but little damaged</option>
          </select>
          <div className="giveaway">
            <input
              className="checkbox"
              type="checkbox"
              checked={isGiveaway || false}
              onChange={() => setIsGiveaway(!isGiveaway)}
            />
            <p className="main-p checkbox">
              This is a giveaway! (People can borrow it for an indefinite time)
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
            <p className="modal-p">
              Add {postAndCommunities.post.title} to community
            </p>
          ) : (
            <p className="modal-p">
              You have shared {postAndCommunities.post.title} in all your
              communities
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
                variables: { postId: postAndCommunities.post._id },
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
            @import "./src/assets/scss/index.scss";

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
    )
  );
}
