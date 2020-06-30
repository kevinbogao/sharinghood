import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import Loading from '../../components/Loading';
import { GET_COMMUNITY } from '../../components/Navbar';
import InlineError from '../../components/InlineError';

const GET_USER_COMMUNITIES = gql`
  query Communities {
    selCommunityId @client
    communities {
      _id
      name
      posts {
        _id
      }
    }
  }
`;

const FIND_COMMUNITY = gql`
  query Community($communityCode: String) {
    community(communityCode: $communityCode) {
      _id
      name
      members {
        _id
      }
    }
    tokenPayload @client
  }
`;

const SELECT_COMMUNITY = gql`
  mutation SelectCommunity($communityId: ID) {
    selectCommunity(communityId: $communityId) @client
  }
`;

const JOIN_COMMUNITY = gql`
  mutation JoinCommunity($communityId: ID!) {
    joinCommunity(communityId: $communityId) {
      _id
      name
    }
  }
`;

function SelectCommunity({ history, location }) {
  let code;
  const { fromLogin } = location.state || { fromLogin: false };
  const [pageError, setPageError] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [isNewCommunity, setIsNewCommunity] = useState(false);
  const [foundCommunity, setFoundCommunity] = useState(null);

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
      } else if (communities.length === 1 && fromLogin) {
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

  // Find community, limit user communities to 5
  const [community] = useLazyQuery(FIND_COMMUNITY, {
    onCompleted: ({ community, tokenPayload }) => {
      // True if user is inside of community members array
      const userIsInCommunity = community.members.some(
        (member) => member._id === tokenPayload.userId,
      );

      if (community) {
        // Throw erorr if user is in 5 communities already
        if (data.communities.length > 5)
          setPageError({
            code: 'You have reached the maximum number of communities',
          });
        // Check if user is part of the community
        else if (userIsInCommunity)
          setPageError({
            code: `You are already a member of ${community.name}`,
          });
        else setFoundCommunity(community);
      } else {
        setPageError({ code: 'Community not found' });
      }
    },
    onError: ({ message }) => {
      setPageError({ community: message });
    },
  });

  // Add user to community
  const [joinCommunity, { loading: mutationLoading }] = useMutation(
    JOIN_COMMUNITY,
    {
      update(cache, { data: { joinCommunity } }) {
        // Get and update communities cache
        const { communities } = cache.readQuery({
          query: GET_USER_COMMUNITIES,
        });
        cache.writeQuery({
          query: GET_USER_COMMUNITIES,
          communities: [...communities, joinCommunity],
        });

        // Set community id
        selectCommunity({
          variables: {
            communityId: joinCommunity._id,
          },
        });

        // Redirect to posts page
        history.push('/find');
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  // Validate if community code is valid or is entered
  function validate() {
    const errors = {};
    if (!code.value) errors.code = 'Please enter a community code';
    else if (/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(code.value)) {
      errors.code = 'Please only use standard alphanumerics';
    }
    setPageError(errors);
    return errors;
  }

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="communities-control">
      {isNewCommunity ? (
        <>
          {foundCommunity ? (
            <div>
              <p className="prev-p">Join {foundCommunity.name}</p>
              <button
                className="prev-btn"
                type="button"
                onClick={() => {
                  joinCommunity({
                    variables: {
                      communityId: foundCommunity._id,
                    },
                  });
                }}
              >
                Yes
              </button>
              <button
                className="prev-btn red"
                type="button"
                onClick={() => {
                  setFoundCommunity(null);
                  setIsNewCommunity(false);
                }}
              >
                No
              </button>
            </div>
          ) : (
            <>
              <p className="prev-p">Join an existing community</p>
              <input
                className="prev-input"
                placeholder="Community Code"
                ref={(node) => (code = node)}
              />
              {pageError.code && <InlineError text={pageError.code} />}
              <button
                className="prev-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const errors = validate();
                  if (Object.keys(errors).length === 0) {
                    community({
                      variables: {
                        communityCode: code.value,
                      },
                    });
                  }
                }}
              >
                Find community
              </button>
              <button
                className="prev-btn bronze"
                type="button"
                onClick={() => {
                  history.push('/create-community');
                }}
              >
                Create Community
              </button>
            </>
          )}
        </>
      ) : (
        <>
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
          <p className="prev-p">Join an other community</p>
          <button
            className="prev-btn bronze"
            type="button"
            onClick={() => {
              setIsNewCommunity(true);
            }}
          >
            New Community
          </button>
        </>
      )}
      {mutationLoading && <Loading isCover />}
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
  location: PropTypes.shape({
    state: PropTypes.shape({
      fromLogin: PropTypes.bool,
    }),
  }).isRequired,
};

export default SelectCommunity;
