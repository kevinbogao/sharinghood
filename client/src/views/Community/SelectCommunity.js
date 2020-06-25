import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import Loading from '../../components/Loading';
import { GET_COMMUNITY } from '../../components/Navbar';

const GET_USER_COMMUNITIES = gql`
  query Communities {
    selCommunityId @client
    communities {
      _id
      name
    }
  }
`;

const SELECT_COMMUNITY = gql`
  mutation SelectCommunity($communityId: ID) {
    selectCommunity(communityId: $communityId) @client
  }
`;

function SelectCommunity({ history }) {
  const [selectedId, setSelectedId] = useState(null);

  // Set selectedCommunityId in cache & localStorage, refetch community
  // with selected communityId
  const [selectCommunity] = useMutation(SELECT_COMMUNITY, {
    refetchQueries: [
      {
        query: GET_COMMUNITY,
        variables: { communityId: selectedId },
      },
    ],
    onCompleted: () => {
      history.push('/find');
    },
  });

  // Redirect user to posts page if selCommunityId exists (communityId)
  // in localStorage or user is only in one community.
  const { loading, error, data } = useQuery(GET_USER_COMMUNITIES, {
    onCompleted: ({ selCommunityId, communities }) => {
      // Check if selectedCommunityId exists in communities array
      const isIdInArray = communities.some(
        (community) => community._id === selCommunityId,
      );

      if (selCommunityId && isIdInArray) {
        selectCommunity({
          variables: {
            communityId: selCommunityId,
          },
        });
        history.push('/find');
      } else if (communities.length === 1) {
        selectCommunity({
          variables: {
            communityId: communities[0]._id,
          },
        });
        history.push('/find');
      }
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="communities-control">
      <p className="prev-p">Select a community</p>
      {data &&
        data.communities.map((community) => (
          <button
            key={community._id}
            className="prev-btn"
            type="submit"
            onClick={() => {
              setSelectedId(community._id);
              selectCommunity({
                variables: {
                  communityId: community._id,
                },
              });
            }}
          >
            {community.name}
          </button>
        ))}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .communities-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            .prev-p {
              margin: 20px auto;

              span {
                color: $green-100;
              }
            }

            .prev-btn {
              display: block;
              margin-top: 30px;
            }
          }
        `}
      </style>
    </div>
  );
}

SelectCommunity.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default SelectCommunity;
