import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
import Modal from 'react-modal';
import Loading from '../../components/Loading';
import ProductScreenshot from '../../assets/images/product-screenshot.png';
import { GET_COMMUNITY } from '../../components/Navbar';

const MODAL_STYLE = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderWidth: 0,
    boxShadow: '0px 0px 6px #f2f2f2',
    padding: '30px',
    minWidth: '300px',
  },
};

const GET_USER_COMMUNITIES = gql`
  query Communities {
    selCommunityId @client
    communities {
      _id
      name
    }
  }
`;

const FIND_COMMUNITY = gql`
  query Community($communityCode: String!) {
    community(communityCode: $communityCode) {
      _id
      name
      code
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
  const client = useApolloClient();
  const [pageError, setPageError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [isErrModalOpen, setIsErrModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Find community by community code from url
  const { loading, error, data } = useQuery(FIND_COMMUNITY, {
    variables: { communityCode: match.params.communityCode },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // Set selectedCommunityId in cache & localStorage, refetch community
  // with selected communityId
  const [selectCommunity] = useMutation(SELECT_COMMUNITY, {
    refetchQueries: [
      {
        query: GET_COMMUNITY,
        variables: { communityId: selectedId },
      },
    ],
    // Redirect user to posts page on complete
    onCompleted: () => {
      history.push('/find');
    },
  });

  // Mutation for user to joinCommunity
  const [joinCommunity, { loading: mutationLoading }] = useMutation(
    JOIN_COMMUNITY,
    {
      update(cache, { data: { joinCommunity } }) {
        // Get and update communities cache
        try {
          const { communities } = cache.readQuery({
            query: GET_USER_COMMUNITIES,
          });

          cache.writeQuery({
            query: GET_USER_COMMUNITIES,
            communities: [...communities, joinCommunity],
          });

          // eslint-disable-next-line
        } catch (err) {}

        // Set community id
        selectCommunity({
          variables: {
            communityId: joinCommunity._id,
          },
        });
      },
      onError: ({ message }) => {
        setPageError(message);
      },
    },
  );

  // Try to join user to community if user is logged in,
  // esle redirect user CommunityExist component
  function handleSubmit(data) {
    if (data.tokenPayload) {
      // Check if user is part of the community
      const userIsMember = data.community.members.some(
        (member) => member._id === data.tokenPayload.userId,
      );

      // Get user communities from cache
      const { communities } = client.readQuery({
        query: GET_USER_COMMUNITIES,
      });

      // Open error modal if user is part of 5 communities already
      if (communities.length >= 5) {
        setPageError('You have reached the maximum number of communities');
        setIsErrModalOpen(true);
        // Open error modal if user is part of the the community already
      } else if (userIsMember) {
        setPageError(`You are already a member of ${data.community.name}`);
        setIsErrModalOpen(true);
      } else {
        setIsJoinModalOpen(true);
      }
    } else {
      history.push({
        pathname: '/find-community',
        state: {
          communityId: data.community._id,
          communityCode: data.community.code,
          communityName: data.community.name,
          members: data.community.members,
          isCreator: false,
        },
      });
    }
  }

  return loading ? (
    <Loading />
  ) : (
    <div className="community-invite-control">
      {error ? (
        <h3>The invite link you have entered is invalid.</h3>
      ) : (
        <>
          <div className="invite-text">
            <h3>Amazing to see you here!</h3>
            <p>You have been invited to {data.community.name}</p>
            <p>
              Sharinghood is a platform which enables you to share items with
              your community.
            </p>
            <p>You are only one registration away from an easier life.</p>
            <button
              className="main-btn"
              onClick={() => handleSubmit(data)}
              type="submit"
            >
              Join {data.community.name} now
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
            <button
              className="main-btn"
              onClick={() => handleSubmit(data)}
              type="submit"
            >
              Join {data.community.name} now
            </button>
          </div>
          <Modal
            isOpen={isJoinModalOpen}
            style={MODAL_STYLE}
            onRequestClose={() => {
              setIsJoinModalOpen(false);
            }}
          >
            <p className="modal-p">Join {data.community.name}?</p>
            <button
              className="prev-btn"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSelectedId(data.community._id);
                joinCommunity({
                  variables: {
                    communityId: data.community._id,
                  },
                });
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="modal-btn full bronze"
              onClick={() => {
                setIsJoinModalOpen(false);
              }}
            >
              Close
            </button>
          </Modal>
          <Modal
            isOpen={isErrModalOpen}
            style={MODAL_STYLE}
            onRequestClose={() => {
              setIsErrModalOpen(false);
            }}
          >
            <p className="modal-p">{pageError}</p>
            <button
              type="button"
              className="modal-btn full bronze"
              onClick={() => {
                setIsErrModalOpen(false);
              }}
            >
              Close
            </button>
          </Modal>
        </>
      )}
      {mutationLoading && <Loading isCover />}
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
