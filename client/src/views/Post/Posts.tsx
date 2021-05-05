import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import ItemsGrid from "../../components/ItemsGrid";
import Spinner from "../../components/Spinner";
import ServerError from "../../components/ServerError";
import { transformImgUrl } from "../../utils/helpers";
import { queries, typeDefs } from "../../utils/gql";

export default function Posts({ communityId }: { communityId: string }) {
  const { loading, error, data, client } = useQuery<
    typeDefs.PostsData,
    typeDefs.PostsVars
  >(queries.GET_POSTS, {
    skip: !communityId,
    variables: { communityId },
    onError: ({ message }) => {
      console.warn(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <ItemsGrid isPost communityId={communityId}>
      {data?.posts.map((post) => (
        <div key={post._id} className="item-card">
          <Link
            to={{
              pathname: `/shared/${post._id}`,
              state: { image: post.image },
            }}
            onMouseOver={() => {
              client.query({
                query: queries.GET_POST,
                variables: { postId: post._id },
              });
            }}
          >
            <div
              className="item-img"
              style={{
                backgroundImage: `url(${transformImgUrl(
                  JSON.parse(post.image).secure_url,
                  300
                )})`,
              }}
            />
            <div className="item-info">
              <p className="item-title">{post.title}</p>
              <p>by {post.creator.name}</p>
            </div>
          </Link>
        </div>
      ))}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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
  );
}
