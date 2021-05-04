// @ts-nocheck

import { useState } from "react";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import { useLazyQuery, useReactiveVar } from "@apollo/client";
import InlineError from "../components/InlineError";
import { queries } from "../utils/gql";
import { validateForm, setErrorMsg } from "../utils/helpers";
import { accessTokenVar } from "../utils/cache";
import vase from "../assets/images/vase.png";

export default function Home({ history }) {
  let code;
  const [isCreate, setIsCreate] = useState(false);
  const [error, setError] = useState({});
  const accessToken = useReactiveVar(accessTokenVar);
  const [community] = useLazyQuery(queries.FIND_COMMUNITY_AND_MEMBERS, {
    onCompleted: ({ community }) => {
      if (community) {
        history.push({
          pathname: "/find-community",
          state: {
            communityId: community._id,
            communityName: community.name,
            members: community.members,
            isCreator: false,
          },
        });
      } else {
        setError({ code: "Community not found" });
      }
    },
    onError: ({ message }) => {
      setErrorMsg(message, setError);
    },
  });

  return accessToken ? (
    <Redirect to="/find" />
  ) : (
    <div className="home-control">
      <div className="home-content">
        <div className="home-intro">
          <p className="main-p">Refuse. Dispose. Separate.</p>
          <p className="main-p">
            Find appreciation for your items by consuming less and sharing more.
          </p>
        </div>
        <div className="home-community">
          <div className="home-switch">
            <button
              type="button"
              className={`${isCreate && "active"}`}
              onClick={() => setIsCreate(true)}
            >
              Create Your Community
            </button>
            <div className="switch-btn-separator" />
            <button
              type="button"
              className={`${!isCreate && "active"}`}
              onClick={() => setIsCreate(false)}
            >
              Enter Community Code
            </button>
          </div>
          {isCreate ? (
            <Link to="/create-community">
              <button type="button" className="main-btn create">
                Create Community
              </button>
            </Link>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const errors = validateForm({ code }, setError);
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
                className="main-input"
                placeholder="Community Code"
                ref={(node) => (code = node)}
              />
              {error.code && <InlineError text={error.code} />}
              <button className="main-btn" type="submit">
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
          @import "./src/assets/scss/index.scss";

          .home-control {
            display: flex;
            flex-direction: column;

            .main-p {
              max-width: initial;
            }

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
                    color: $black;

                    &.active {
                      color: $orange;
                    }
                  }
                }

                .main-input {
                  width: 220px;
                }

                .main-btn {
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
              background-color: $grey-100;

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
