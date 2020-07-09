import React from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import ItemsGrid from '../../components/ItemsGrid';
import Loading from '../../components/Loading';

const GET_COMMUNITY_ID = gql`
  query {
    selCommunityId @client
  }
`;

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

function Posts() {
  const {
    data: { selCommunityId },
  } = useQuery(GET_COMMUNITY_ID);
  const { loading, error, data } = useQuery(GET_POSTS, {
    skip: !selCommunityId,
    variables: { communityId: selCommunityId },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <ItemsGrid isPost>
      {data?.posts?.map((post) => (
        <div key={post._id} className="item-card">
          <Link
            to={{
              pathname: `/shared/${post._id}`,
              state: { image: post.image },
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
          @import './src/assets/scss/index.scss';

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
                width: 60vw;
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

export { GET_POSTS, Posts };
