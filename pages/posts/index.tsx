import { useEffect, RefObject } from "react";
import Link from "next/link";
import { useQuery, useReactiveVar } from "@apollo/client";
import { Container } from "../../components/Container";
import ItemsGrid from "../../components/ItemGrid";
import { queries } from "../../lib/gql";
import { transformImgUrl } from "../../lib";
import { communityIdVar } from "../_app";
import type { PostsData, PostsVars } from "../../lib/types";

interface PostsProps {
  parent: RefObject<HTMLDivElement>;
}

export default function Posts({ parent }: PostsProps) {
  const communityId = useReactiveVar(communityIdVar);
  const { loading, error, data, client, fetchMore } = useQuery<
    PostsData,
    PostsVars
  >(queries.GET_POSTS, {
    skip: !communityId,
    variables: { offset: 0, limit: 10, communityId: communityId! },
    onError({ message }) {
      console.warn(message);
    },
  });

  function onScroll() {
    if (parent.current) {
      const { scrollTop, scrollHeight, clientHeight } = parent.current;
      if (scrollTop + clientHeight === scrollHeight) {
        fetchMore({
          variables: {
            offset: data?.posts.length,
            limit: 10,
            communityId: communityIdVar()!,
          },
        });
      }
    }
  }

  useEffect(() => {
    if (parent?.current) {
      parent.current.addEventListener("scroll", onScroll);
    }

    return () => parent?.current?.removeEventListener("scroll", onScroll);
  }, [data]);

  return (
    <Container loading={loading} error={error}>
      <ItemsGrid type="post" communityId={communityId!}>
        {data?.posts?.map((post) => (
          <div key={post.id} className="item-card">
            <Link href={`/posts/${post.id}`}>
              <a
                onMouseOver={() => {
                  client.query({
                    query: queries.GET_POST_DETAILS,
                    variables: { postId: post.id, communityId: communityId! },
                  });
                }}
              >
                <div
                  className="item-img"
                  style={{
                    backgroundImage: `url(${transformImgUrl(
                      post.imageUrl,
                      300
                    )})`,
                  }}
                />
                <div className="item-info">
                  <p className="item-title">{post.title}</p>
                  <p>by {post.creator.name}</p>
                </div>
              </a>
            </Link>
          </div>
        ))}
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
                background-size: cover;
                background-position: center;

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
      </ItemsGrid>
    </Container>
  );
}
