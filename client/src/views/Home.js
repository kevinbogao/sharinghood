import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import InlineError from '../components/InlineError';
import vase from '../assets/images/vase.png';

const GET_ACCESS_TOKEN = gql`
  {
    accessToken @client
  }
`;

const FIND_COMMUNITY = gql`
  query Community($communityCode: String) {
    community(communityCode: $communityCode) {
      _id
      name
      members {
        _id
        image
      }
    }
  }
`;

function Home({ history }) {
  let code;
  const [isCreate, setIsCreate] = useState(false);
  const [error, setError] = useState({});
  const {
    data: { accessToken },
  } = useQuery(GET_ACCESS_TOKEN);
  const [community] = useLazyQuery(FIND_COMMUNITY, {
    onCompleted: ({ community }) => {
      if (community) {
        history.push({
          pathname: '/find-community',
          state: {
            communityId: community._id,
            communityName: community.name,
            members: community.members,
            isCreator: false,
          },
        });
      } else {
        setError({ community: 'Community not found' });
      }
    },
    onError: ({ message }) => {
      const errMsgArr = message.split(': ');
      setError({ [errMsgArr[0]]: errMsgArr[1] });
    },
  });

  function validate() {
    const errors = {};
    if (!code.value) errors.code = 'Please enter a community code';
    else if (/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(code.value)) {
      errors.code = 'Please only use standard alphanumerics';
    }
    setError(errors);
    return errors;
  }

  return accessToken ? (
    <Redirect to="/find" />
  ) : (
    <div className="home-control">
      <div className="home-content">
        <div className="home-intro">
          <p className="prev-p">Refuse. Dispose. Separate.</p>
          <p className="prev-p">
            Find appreciation for your items by consuming less and sharing more.
          </p>
        </div>
        <div className="home-community">
          <div className="home-switch">
            <button
              type="button"
              className={`${isCreate && 'active'}`}
              onClick={() => setIsCreate(true)}
            >
              Create Your Community
            </button>
            <div className="switch-btn-separator" />
            <button
              type="button"
              className={`${!isCreate && 'active'}`}
              onClick={() => setIsCreate(false)}
            >
              Enter Community Code
            </button>
          </div>
          {isCreate ? (
            <Link to="/create-community">
              <button type="button" className="prev-btn create">
                Create Community
              </button>
            </Link>
          ) : (
            <form
              onSubmit={(e) => {
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
              <input
                className="prev-input"
                placeholder="Community Code"
                ref={(node) => (code = node)}
              />
              {error.code && <InlineError text={error.code} />}
              <button className="prev-btn" type="submit">
                Find my community
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="home-footer">
        <img src={vase} alt="A vase" />
      </div>
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .home-control {
            display: flex;
            flex-direction: column;

            .home-content {
              flex: 1 1 0%;
              margin: auto;
              display: flex;
              justify-content: space-between;
              align-items: center;
              overflow-y: scroll;

              @include xl {
                max-width: 80vw;
              }

              @include lg {
                flex-direction: column;
                justify-content: center;
              }

              .home-intro {
                flex: 1;
                text-align: center;

                @include lg {
                  flex: initial;
                }

                p {
                  margin: 20px auto;
                  width: 60%;

                  @include sm {
                    width: 80%;
                  }
                }

                @include lg {
                  margin-bottom: 40px;
                }
              }

              .home-community {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;

                @include lg {
                  flex: initial;
                }

                .home-switch {
                  max-width: 500px;
                  display: flex;

                  button {
                    margin: auto 20px;
                    display: block;
                    font-size: 18px;
                    background: none;
                    border-width: 0;
                    cursor: pointer;
                    color: $bronze-200;

                    &:hover {
                      background: $grey-100;
                    }

                    &.active {
                      color: $green-100;
                    }
                  }
                }

                .prev-input {
                  margin-top: 30px;
                  width: 220px;
                }

                .prev-btn {
                  margin-top: 20px;
                  display: block;
                  width: 240px;

                  &.create {
                    margin-top: 90px;
                  }
                }
              }
            }

            .home-footer {
              width: 100vw;
              height: 60px;
              background-color: $grey-200;

              img {
                position: absolute;
                width: 50px;
                height: 120px;
                right: 60px;
                bottom: 30px;

                @include sm {
                  width: 40px;
                  height: 96px;
                  right: 20px;
                  bottom: 20px;
                }
              }
            }
          }
        `}
      </style>
    </div>
  );
}

Home.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Home;
