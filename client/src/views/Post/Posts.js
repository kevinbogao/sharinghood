import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import ItemsGrid from "../../components/ItemsGrid";
import Spinner from "../../components/Spinner";

const GET_POSTS = gql`
  query Posts($communityId: ID!) {
    posts(communityId: $communityId) {
      _id
      title
      image
      creator {
        _id
        name
      }
    }
  }
`;

const GET_POST = gql`
  query Post($postId: ID!) {
    post(postId: $postId) {
      _id
      title
      desc
      image
      condition
      isGiveaway
      creator {
        _id
        name
        image
        apartment
        createdAt
      }
      threads {
        _id
        content
        poster {
          _id
        }
        community {
          _id
        }
      }
    }
  }
`;

function Posts({ communityId }) {
  const { loading, error, data, client } = useQuery(GET_POSTS, {
    skip: !communityId,
    variables: { communityId },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <ItemsGrid isPost communityId={communityId}>
      {data?.posts?.map((post) => (
        <div key={post._id} className="item-card">
          <Link
            to={{
              pathname: `/shared/${post._id}`,
              state: { image: post.image },
            }}
            onMouseOver={() => {
              client.query({
                query: GET_POST,
                variables: { postId: post._id },
              });
            }}
          >
            <div
              className="item-img"
              style={{
                backgroundImage: `url(${JSON.parse(post.image).secure_url})`,
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

Posts.propTypes = {
  communityId: PropTypes.string.isRequired,
};

export { GET_POSTS, Posts };
