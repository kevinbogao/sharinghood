import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import Loading from '../../components/Loading';
import ProductScreenshot from '../../assets/images/product-screenshot.png';
import { GET_COMMUNITY } from '../../components/Navbar';

const FIND_COMMUNITY = gql`
  query Community($communityCode: String!) {
    community(communityCode: $communityCode) {
      _id
      name
      members {
        _id
        image
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

function CommunityInvite({ match, history }) {
  const [community, setCommunity] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log(isLoggedIn);

  const { loading } = useQuery(FIND_COMMUNITY, {
    variables: { communityCode: match.params.communityCode },
    onCompleted: ({ community, tokenPayload }) => {
      console.log(tokenPayload);
      setCommunity(community);

      // Set log in status if tokenPayload exists
      if (tokenPayload) {
        setIsLoggedIn(true);
      }
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // // Set selectedCommunityId in cache & localStorage, refetch community
  // // with selected communityId
  // const [selectCommunity] = useMutation(SELECT_COMMUNITY, {
  //   refetchQueries: [
  //     {
  //       query: GET_COMMUNITY,
  //       variables: { communityId: selectedId },
  //     },
  //   ],
  //   onCompleted: () => {
  //     history.push('/find');
  //   },
  // });

  // // Add user to community
  // const [joinCommunity, { loading: mutationLoading }] = useMutation(
  //   JOIN_COMMUNITY,
  //   {
  //     update(cache, { data: { joinCommunity } }) {
  //       // Get and update communities cache
  //       const { communities } = cache.readQuery({
  //         query: GET_USER_COMMUNITIES,
  //       });
  //       cache.writeQuery({
  //         query: GET_USER_COMMUNITIES,
  //         communities: [...communities, joinCommunity],
  //       });

  //       // Set community id
  //       selectCommunity({
  //         variables: {
  //           communityId: joinCommunity._id,
  //         },
  //       });

  //       // Redirect to posts page
  //       history.push('/find');
  //     },
  //     onError: ({ message }) => {
  //       console.log(message);
  //     },
  //   },
  // );

  function handleSubmit() {
    history.push({
      pathname: '/find-community',
      state: {
        communityId: community._id,
        communityName: community.name,
        members: community.members,
        isCreator: false,
      },
    });
  }

  return loading ? (
    <Loading />
  ) : (
    <div className="community-invite-control">
      {community ? (
        <>
          <div className="invite-text">
            <h3>Amazing to see you here!</h3>
            <p>You have been invited to {community.name}</p>
            <p>
              Sharinghood is a platform which enables you to share items with
              your community.
            </p>
            <p>You are only one registration away from an easier life.</p>
            <button className="main-btn" onClick={handleSubmit} type="submit">
              Join {community.name} now
            </button>
          </div>
          <div className="invite-img">
            <div className="img-text">
              <h3>How does it work?</h3>
              <p>
                Browse through the items which your community members are
                willing to share.. If you don’t find what you need, simply
                request it.
              </p>
              <div className="img-image">
                <img src={ProductScreenshot} alt="Screenshot of our product" />
              </div>
            </div>
            <button className="main-btn" onClick={handleSubmit} type="submit">
              Join {community.name} now
            </button>
          </div>
        </>
      ) : (
        <h3>The invite link you have entered is invalid.</h3>
      )}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';
          .community-invite-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: $xl-max-width;
            text-align: center;

            @include lg {
              flex-direction: column;
              justify-content: center;
            }

            @include sm {
              margin-top: 0;
              justify-content: flex-start;
              align-items: stretch;
            }

            h3 {
              margin: 0 auto auto auto;
              font-size: 20px;
            }

            p {
              font-size: 14px;
              margin: 14px auto;
            }

            .invite-text {
              padding: 50px;
              background: $beige;

              @include sm {
                padding: 40px;
              }

              p {
                max-width: 300px;

                @include lg {
                  max-width: 400px;
                }
              }
            }

            .invite-img {
              @include lg {
                margin: 50px auto;
              }

              p {
                max-width: 500px;
                margin: 14px auto 20px auto;
              }

              img {
                width: 500px;

                @include sm {
                  width: 80vw;
                }
              }
            }
          }

          .invalid-link {
            position: absolute;
            top: 50%;
            left: 50%;
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
        `}
      </style>
    </div>
  );
}

CommunityInvite.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      communityCode: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default CommunityInvite;
