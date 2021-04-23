import React, { useState, useEffect, useRef } from "react";
import { useHistory, Link, NavLink } from "react-router-dom";
import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faBell,
  faCaretDown,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { queries, mutations } from "../utils/gql";

function Navbar() {
  const node = useRef();
  const history = useHistory();
  const client = useApolloClient();
  const [isMenuActive, setIsMenuActive] = useState(false);

  // Get local session data
  const {
    data: { accessToken, tokenPayload, selCommunityId },
    refetch,
  } = useQuery(queries.LOCAL_SESSION_DATA);

  // Get current community & user's communities
  const { data } = useQuery(queries.GET_CURRENT_COMMUNITY_AND_COMMUNITIES, {
    skip: !accessToken || !selCommunityId,
    variables: { communityId: selCommunityId },
    onError: () => {},
  });

  // Revoke user's refreshToken
  const [logout] = useMutation(mutations.LOGOUT);

  function handleClickOutside(e) {
    if (node.current.contains(e.target)) {
      return;
    }
    setIsMenuActive(false);
  }

  // Handling clicking outside of MainDrawer
  useEffect(() => {
    if (isMenuActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuActive]);

  function toggleMenu() {
    setIsMenuActive(!isMenuActive);
  }

  return (
    <div ref={node} className="nav-control">
      <div className="nav-toggle">
        {!!accessToken && (
          <FontAwesomeIcon
            className="hamburger-icon"
            icon={faBars}
            onClick={toggleMenu}
          />
        )}
      </div>
      <div className="nav-logo">
        {data?.communities.find(
          (community) =>
            community._id !== selCommunityId && community.hasNotifications
        ) && <span className="communities-unread" />}
        <h1 className={selCommunityId && "select"}>
          <Link
            to={
              tokenPayload && selCommunityId
                ? "/find"
                : tokenPayload && !selCommunityId
                ? "/communities"
                : "/"
            }
          >
            {data?.community?.name || "Sharinghood"}
          </Link>
        </h1>
        {data?.communities && (
          <FontAwesomeIcon
            className="logo-icon"
            icon={faCaretDown}
            onClick={() => {
              client.writeQuery({
                query: gql`
                  query {
                    selCommunityId
                  }
                `,
                data: {
                  selCommunityId: null,
                },
              });
              localStorage.removeItem("@sharinghood:selCommunityId");
              history.push("/communities");
            }}
          />
        )}
      </div>
      <div className="nav-user">
        <div className="nav-user-content">
          {!!accessToken ? (
            <div className="nav-icons">
              {selCommunityId && (
                <>
                  <FontAwesomeIcon
                    className="nav-icon"
                    icon={faUser}
                    onClick={() => history.push("/profile")}
                    onMouseOver={() => {
                      client.query({
                        query: queries.GET_USER,
                      });
                    }}
                  />
                  <FontAwesomeIcon
                    className="nav-icon"
                    icon={faBell}
                    onClick={() => history.push("/notifications")}
                  />
                  {data?.communities.filter(
                    (community) => community._id === selCommunityId
                  )[0]?.hasNotifications && (
                    <span className="notifications-unread" />
                  )}
                </>
              )}
              <FontAwesomeIcon
                className="nav-icon"
                icon={faSignOutAlt}
                onClick={async () => {
                  // revoke refreshToken
                  await logout();

                  // Clear localStorage
                  localStorage.removeItem("@sharinghood:accessToken");
                  localStorage.removeItem("@sharinghood:refreshToken");
                  localStorage.removeItem("@sharinghood:selCommunityId");

                  // Clear loacl cache
                  await client.clearStore();

                  // Fetch tokenPayload to clean local state
                  refetch();

                  // Return to login page
                  history.push("/login");
                }}
              />
            </div>
          ) : (
            <button type="button" className="login-btn">
              <Link to="/login">Log in</Link>
            </button>
          )}
        </div>
      </div>
      <div className={`nav-menu ${isMenuActive && "active"}`}>
        <NavLink className="nav-menu-item" to="/" onClick={toggleMenu}>
          Home
        </NavLink>
        <NavLink className="nav-menu-item" to="/find" onClick={toggleMenu}>
          Find
        </NavLink>
        <NavLink className="nav-menu-item" to="/request" onClick={toggleMenu}>
          Request
        </NavLink>
        <NavLink className="nav-menu-item" to="/share" onClick={toggleMenu}>
          Share
        </NavLink>
        {tokenPayload?.isAdmin && (
          <NavLink
            className="nav-menu-item dashboard"
            to="/dashboard"
            onClick={toggleMenu}
          >
            Dashboard
          </NavLink>
        )}
        {data?.community?.creator._id === tokenPayload?.userId && (
          <div className="nav-menu-item invite">
            <NavLink
              className="invite-btn"
              to={{
                pathname: "/community-link",
                state: {
                  communityId: data?.community?._id,
                  communityCode: data?.community?.code,
                  isRegistered: true,
                },
              }}
            >
              Download Invitation
            </NavLink>
          </div>
        )}
      </div>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .nav-control {
            width: 100vw;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0px 2px 4px $grey-200;
            background: $background;

            .nav-toggle {
              flex: 1;
              margin-left: 20px;
              .hamburger-menu {
                width: 28px;
                height: 20px;
              }
            }

            .nav-logo {
              display: flex;

              .communities-unread {
                margin: auto 10px auto 0;
                width: 10px;
                height: 10px;
                text-align: center;
                background: $blue;
                border-radius: 50%;
              }

              h1 {
                font-size: 26px;
                text-align: center;
                color: $orange;
                font-weight: bold;

                @include sm {
                  font-size: 21px;

                  &.select {
                    width: 120px;
                    white-space: nowrap;
                    overflow: hidden;
                  }
                }
              }
            }

            .nav-user {
              flex: 1;
              display: flex;
              margin-right: 10px;

              .nav-user-content {
                margin-left: auto;

                .login-btn {
                  width: 70px;
                  height: 40px;
                  font-size: 18px;
                  background: none;
                  border-width: 0;
                  border-radius: 6px;
                  color: $orange;
                  font-family: $font-stack;

                  &:hover {
                    background: $grey-200;
                  }
                }

                .notifications-unread {
                  position: absolute;
                  top: 14px;
                  right: 73px;
                  width: 10px;
                  height: 10px;
                  text-align: center;
                  background: $blue;
                  border-radius: 50%;

                  @include sm {
                    right: 46px;
                  }
                }
              }
            }

            .nav-menu {
              top: 62px;
              position: fixed;
              max-width: 260px;
              width: 80%;
              height: calc(100vh - 62px);
              transform: translateX(-100%);
              transition: all 250ms ease-in-out;
              display: flex;
              flex-direction: column;
              align-items: center;
              z-index: 6000;

              &.active {
                background: $background;
                box-shadow: 2px 0px $grey-100;
                transform: translateY(0%);
              }
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import "./src/assets/scss/index.scss";

          .hamburger-icon {
            font-size: 23px;
            transform: scale(1.3, 1);

            @include sm {
              font-size: 19px;
            }
          }

          .nav-icon {
            color: $orange;
            font-size: 18px;
            margin-left: 10px;
            border-radius: 50%;
            padding: 12px;
            cursor: pointer;

            @include sm {
              margin-left: 5px;
              padding: 5px;
              font-size: 17px;
            }

            &:hover {
              background: $grey-100;
            }
          }

          .logo-icon {
            color: $beige;
            margin: auto 12px;
            font-size: 22px;
          }

          .nav-menu-item {
            display: block;
            line-height: 60px;
            width: calc(100% - 20px);
            height: 60px;
            cursor: pointer;
            background: $background;
            color: $black;
            font-weight: bold;
            font-size: 18px;
            padding-left: 20px;

            &.dashboard {
              color: $orange;
            }

            &:hover {
              background: $grey-100;

              &.invite {
                background: $background;
              }
            }

            .invite-btn {
              padding: 10px 20px;
              margin-left: 8px;
              color: $background;
              background: $orange;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Navbar;
