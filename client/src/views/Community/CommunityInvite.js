import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';
import Loading from '../../components/Loading';
import ProductScreenshot from '../../assets/images/product-screenshot.png';

const FIND_COMMUNITY = gql`
  query FindCommunity($communityCode: String!) {
    findCommunity(communityCode: $communityCode) {
      _id
      name
      members {
        _id
        image
      }
    }
  }
`;

function CommunityInvite({ match, history }) {
  const [community, setCommunity] = useState(null);
  const { loading } = useQuery(FIND_COMMUNITY, {
    variables: { communityCode: match.params.communityCode },
    onCompleted: ({ findCommunity }) => {
      setCommunity(findCommunity);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

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
              Sharinghood is a plattform which enables you to share items with
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
                willing to share.. If you don’t find why you need, simply
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
