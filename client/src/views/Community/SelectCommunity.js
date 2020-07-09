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
      hasNotifications
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
  const { communityCode } = location.state || { communityCode: null };
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
      // Redirect user to CommunityInvite page if user is redirected from
      // Login page and has a communityCode; else redirect user to posts page
      if (communityCode) history.push(`/community/${communityCode}`);
      else history.push('/find');
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

      // If selected community id exists in localStorage & it the user is a member of that community
      if (selCommunityId && isIdInArray) {
        selectCommunity({
          variables: {
            communityId: selCommunityId,
          },
        });

        // Redirect to posts page
        history.push('/find');

        // If user is redirect from login and only has one community
      } else if (communities.length === 1 && fromLogin) {
        selectCommunity({
          variables: {
            communityId: communities[0]._id,
          },
        });

        // Redirect to posts page
        history.push('/find');

        // If user is redirect from login and communityCode is given
      } else if (fromLogin && communityCode) {
        selectCommunity({
          variables: {
            communityId: communities[0]._id,
          },
        });
      }
      // eslint-disable-next-line
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Find community, limit user communities to 5
  const [community] = useLazyQuery(FIND_COMMUNITY, {
    onCompleted: ({ community, tokenPayload }) => {
      if (community) {
        // True if user is inside of community members array
        const userIsMember = community.members.some(
          (member) => member._id === tokenPayload.userId,
        );

        // Throw erorr if user is in 5 communities already
        if (data.communities.length >= 5)
          setPageError({
            code: 'You have reached the maximum number of communities',
          });
        // Check if user is part of the community
        else if (userIsMember)
          setPageError({
            code: `You are already a member of ${community.name}`,
          });
        else setFoundCommunity(community);
      } else {
        // Set community error if community is not found
        setPageError({ code: 'Community not found' });
      }
    },
    onError: ({ message }) => {
      const errMsgArr = message.split(': ');
      const errMsgArrLen = errMsgArr.length;
      setPageError({
        [errMsgArr[errMsgArrLen - 2]]: errMsgArr[errMsgArrLen - 1],
      });
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
              <p className="main-p">Join {foundCommunity.name}</p>
              <button
                className="main-btn block"
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
                className="main-btn block grey"
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
              <p className="main-p">Join an existing community</p>
              <input
                className="main-input"
                placeholder="Community Code"
                ref={(node) => (code = node)}
              />
              {pageError.code && <InlineError text={pageError.code} />}
              <button
                className="main-btn block"
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
              <p className="main-p">Or create your own community</p>
              <button
                className="main-btn block"
                type="button"
                onClick={() => {
                  if (data.communities.length >= 5) {
                    setPageError({
                      code:
                        'You have reached the maximum number of communities',
                    });
                  } else {
                    history.push({
                      pathname: '/create-community',
                      state: { isLoggedIn: true },
                    });
                  }
                }}
              >
                Create Community
              </button>
              <button
                className="main-btn block grey"
                type="button"
                onClick={() => {
                  setIsNewCommunity(false);
                  setPageError({});
                }}
              >
                Return
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <p className="main-p">Select a community</p>
          {data &&
            data.communities.map((community) => (
              <button
                key={community._id}
                className="main-btn block beige"
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
                {community.hasNotifications && (
                  <span className="community-unread" />
                )}
              </button>
            ))}
          <p className="main-p">Join an other community</p>
          <button
            className="main-btn block"
            type="button"
            onClick={() => {
              if (data.communities.length >= 5) {
                setPageError({
                  code: 'You have reached the maximum number of communities',
                });
              } else {
                setIsNewCommunity(true);
              }
            }}
          >
            New Community
          </button>
          {pageError.code && <InlineError text={pageError.code} />}
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

            .main-btn {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .community-unread {
              margin-left: 15px;
              width: 10px;
              height: 10px;
              background: $blue;
              border-radius: 50%;
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
