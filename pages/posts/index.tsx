import { useEffect, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useReactiveVar } from "@apollo/client";
import { Container } from "../../components/Container";
import ItemsGrid from "../../components/ItemGrid";
import { queries } from "../../lib/gql";
import { transformImgUrl } from "../../lib";
import { communityIdVar } from "../_app";
import { ITEMS_LIMIT, THREADS_LIMIT } from "../../lib/const";
import type {
  PostDetailsData,
  PostDetailsVars,
  PaginatedPostsData,
  PaginatedPostsVars,
} from "../../lib/types";

interface PostsProps {
  parent: RefObject<HTMLDivElement>;
}

export default function Posts({ parent }: PostsProps) {
  const communityId = useReactiveVar(communityIdVar);

  const { loading, error, data, client, fetchMore } = useQuery<
    PaginatedPostsData,
    PaginatedPostsVars
  >(queries.GET_PAGINATED_POSTS, {
    skip: !communityId,
    variables: { offset: 0, limit: ITEMS_LIMIT, communityId: communityId! },
    onError({ message }) {
      console.warn(message);
    },
  });

  function onScroll() {
    if (parent.current) {
      const { scrollTop, scrollHeight, clientHeight } = parent.current;
      if (scrollTop + clientHeight === scrollHeight) {
        if (!data?.paginatedPosts.hasMore) return;
        fetchMore<PaginatedPostsData, PaginatedPostsVars>({
          variables: {
            offset: data?.paginatedPosts.posts.length,
            limit: 10,
          },
          updateQuery(prev, { fetchMoreResult }) {
            if (!fetchMoreResult) return prev;

            return {
              ...prev,
              paginatedPosts: {
                ...fetchMoreResult.paginatedPosts,
                posts: [
                  ...prev.paginatedPosts.posts,
                  ...fetchMoreResult.paginatedPosts.posts,
                ],
              },
            };
          },
        });
      }
    }
  }

  useEffect(() => {
    let node: HTMLDivElement | null = null;

    if (parent.current) {
      node = parent.current;
      node.addEventListener("scroll", onScroll);
    }

    return () => {
      if (node) node.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line
  }, [data]);

  return (
    <Container loading={loading} error={error}>
      <ItemsGrid type="post" fetchMore={fetchMore} communityId={communityId!}>
        {data?.paginatedPosts?.posts?.map((post) => (
          <div key={post.id} className="item-card">
            <Link href={`/posts/${post.id}`}>
              <a
                onMouseOver={() => {
                  client.query<PostDetailsData, PostDetailsVars>({
                    query: queries.GET_POST_DETAILS,
                    variables: {
                      postId: post.id,
                      communityId: communityId!,
                      threadsOffset: 0,
                      threadsLimit: THREADS_LIMIT,
                    },
                  });
                }}
              >
                <div className="item-img">
                  <Image
                    alt="profile pic"
                    src={transformImgUrl(post.imageUrl, 300)}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="item-info">
                  <p className="item-title">{post.title}</p>
                  <p>by {post.creator.name}</p>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </ItemsGrid>
      <style jsx>
        {`
          @import "../index.scss";

          .item-card {
            background: $grey-100;
            margin: 20px 10px;
            padding: 10px;
            cursor: pointer;

            .item-img {
              width: 160px;
              height: 136px;
              position: relative;

              @include md {
                width: 190px;
                height: 160px;
              }

              @include sm {
                width: 250px;
                height: 200px;
              }
            }

            &:hover {
              background: $grey-200;
            }

            p {
              color: $black;
              font-size: 14px;
              width: 160px;

              &.item-title {
                margin-top: 10px;
                margin-bottom: 5px;
                font-size: 18px;
              }
            }
          }
        `}
      </style>
    </Container>
  );
}
