import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Notifications from './Notifications';
import hamburger from '../assets/images/hamburger.png';

const GET_SESSION = gql`
  {
    tokenPayload @client
  }
`;

const GET_COMMUNITY = gql`
  query Community {
    community {
      _id
      name
      code
      creator {
        _id
      }
      members {
        _id
        name
        image
      }
    }
  }
`;

function Navbar() {
  const node = useRef();
  const client = useApolloClient();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    data: { tokenPayload },
  } = useQuery(GET_SESSION);
  const { data } = useQuery(GET_COMMUNITY, {
    skip: !tokenPayload,
  });

  function handleClickOutside(e) {
    if (node.current.contains(e.target)) {
      return;
    }
    setIsMenuActive(false);
  }

  // Handling clicking outside of MainDrawer
  useEffect(() => {
    if (isMenuActive) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuActive]);

  function toggleMenu() {
    setIsMenuActive(!isMenuActive);
  }

  function toggleNotifications() {
    setIsNotificationsOpen(!isNotificationsOpen);
  }

  return (
    <div ref={node} className="nav-control">
      <div className="nav-toggle">
        <img
          role="presentation"
          alt="hamburger"
          className="hamburger-menu"
          src={hamburger}
          onClick={toggleMenu}
        />
      </div>
      <div className="nav-logo">
        <h1>
          <Link to={tokenPayload ? '/find' : '/'}>
            {data ? data.community.name : 'Sharinghood'}
          </Link>
        </h1>
      </div>
      <div className="nav-user">
        <div className="nav-user-content">
          {tokenPayload ? (
            <div className="nav-icons">
              <FontAwesomeIcon
                className="nav-icon"
                icon={faBell}
                onClick={toggleNotifications}
              />
              {unreadCount > 0 && (
                <span className="notifications-count">{unreadCount}</span>
              )}
              <Notifications
                isNotificationsOpen={isNotificationsOpen}
                setIsNotificationsOpen={setIsNotificationsOpen}
                unreadCount={unreadCount}
                setUnreadCount={setUnreadCount}
              />
              <FontAwesomeIcon
                className="nav-icon"
                icon={faSignOutAlt}
                onClick={() => {
                  client.writeQuery({
                    query: gql`
                      {
                        token
                        tokenPayload
                      }
                    `,
                    data: { token: null, tokenPayload: null },
                  });
                  localStorage.removeItem('@sharinghood:token');
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
      <div className={`nav-menu ${isMenuActive && 'active'}`}>
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
        <NavLink className="nav-menu-item" to="/dashboard" onClick={toggleMenu}>
          My Bookings & Lendings
        </NavLink>
        <NavLink className="nav-menu-item" to="/chats" onClick={toggleMenu}>
          Messages
        </NavLink>
        {data && data.community.creator._id === tokenPayload.userId && (
          <div className="nav-menu-item invite">
            <NavLink
              className="invite-btn"
              to={{
                pathname: '/community/link',
                state: {
                  communityId: data.community._id,
                  communityCode: data.community.code,
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
          @import './src/assets/scss/index.scss';

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
              // flex: 1;

              h1 {
                font-size: 26px;
                text-align: center;
                color: $bronze-100;
                font-weight: bold;

                @include sm {
                  font-size: 21px;
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
                  color: $bronze-200;
                  font-family: $font-stack;

                  &:hover {
                    background: $grey-200;
                  }
                }

                .notifications-count {
                  position: absolute;
                  top: 11px;
                  right: 66px;
                  color: $background;
                  padding: 2px;
                  width: 13px;
                  text-align: center;
                  background: $red-200;
                  border-radius: 50%;
                  font-size: 11px;

                  @include sm {
                    right: 39px;
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
          @import './src/assets/scss/index.scss';

          .nav-icon {
            color: $green-200;
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

          .nav-menu-item {
            display: block;
            line-height: 60px;
            width: calc(100% - 20px);
            height: 60px;
            cursor: pointer;
            background: $background;
            color: $bronze-100;
            font-weight: bold;
            font-size: 18px;
            padding-left: 20px;

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
              background: $green-200;

              &:hover {
                background: $green-100;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

export default Navbar;
