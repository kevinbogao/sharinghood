import { useState } from "react";
import { NextRouter } from "next/router";
import { useMutation } from "@apollo/client";
import Modal from "react-modal";
import { Loader } from "./Container";
import { transformImgUrl } from "../lib";
import { queries, mutations } from "../lib/gql";
import type {
  Post,
  PostsData,
  PostsVars,
  InactivatePostData,
  InactivatePostVars,
  UserCommunitiesData,
} from "../lib/types";

interface AccountPostsProps {
  posts: Post[];
  router: NextRouter;
}

export default function AccountPosts({ posts, router }: AccountPostsProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [inactivatePost, { loading: mutationLoading }] = useMutation<
    InactivatePostData,
    InactivatePostVars
  >(mutations.INACTIVATE_POST, {
    update(cache, { data }) {
      if (data?.inactivatePost) {
        const userCommunitiesCache = cache.readQuery<UserCommunitiesData, void>(
          {
            query: queries.GET_USER_COMMUNITIES,
          }
        );

        if (userCommunitiesCache) {
          userCommunitiesCache.communities.forEach((community) => {
            const postsCache = cache.readQuery<PostsData, PostsVars>({
              query: queries.GET_POSTS,
              variables: { offset: 0, limit: 10, communityId: community.id },
            });

            if (postsCache) {
              cache.writeQuery<PostsData, PostsVars>({
                query: queries.GET_POSTS,
                variables: { offset: 0, limit: 10, communityId: community.id },
                data: {
                  posts: postsCache.posts.filter(
                    (post) => post.id !== selectedPost?.id
                  ),
                },
              });
            }
          });
        }

        setIsModalOpen(false);
        setSelectedPost(null);
      }
    },
  });

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
          <div key={post.id} className="post-instance">
            <div
              className={`post-img ${isEditing ? "editing" : undefined}`}
              style={{
                backgroundImage: `url(${transformImgUrl(post.imageUrl, 250)})`,
              }}
            />
            <p>{post.title}</p>
            <div className={`post-img-btn ${isEditing ? "active" : undefined}`}>
              <button
                className="post-btn"
                type="button"
                onClick={() => router.push(`/posts/${post.id}/edit`)}
              >
                Edit
              </button>
              <button
                className="post-btn"
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedPost(post);
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
          setSelectedPost(null);
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
            if (selectedPost) {
              inactivatePost({
                variables: { postId: selectedPost.id },
              });
            }
          }}
        >
          {mutationLoading ? <Loader /> : "Yes"}
        </button>
        <button
          type="button"
          className="main-btn modal grey"
          onClick={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
        >
          No
        </button>
      </Modal>
      <style jsx>
        {`
          @import "../pages/index.scss";

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
                margin: 0 5px 10px 0;
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

Modal.setAppElement("#__next");
