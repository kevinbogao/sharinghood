import { useRef, useState, useEffect, RefObject } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { queries, mutations } from "../lib/gql";
import { SVG } from "./Container";
import {
  communityIdVar,
  accessTokenVar,
  refreshTokenVar,
  tokenPayloadVar,
} from "../pages/_app";
import type {
  LogoutData,
  CommunityAndCommunitiesData,
  CommunityAndCommunitiesVars,
} from "../lib/types";

export default function Navbar() {
  const router = useRouter();
  const node: RefObject<HTMLDivElement> | undefined = useRef(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState(0);
  const accessToken = useReactiveVar(accessTokenVar);
  const tokenPayload = useReactiveVar(tokenPayloadVar);

  const { data } = useQuery<
    CommunityAndCommunitiesData,
    CommunityAndCommunitiesVars
  >(queries.GET_COMMUNITY_AND_COMMUNITIES, {
    skip: !accessToken || !communityIdVar(),
    variables: { communityId: communityIdVar()! },
    onCompleted({ communities }) {
      const notificationsCount = communities.reduce(
        (acc, curr) => acc + curr.notificationCount,
        0
      );
      setNotificationCounts(notificationsCount);
    },
    onError({ message }) {
      console.warn(message);
    },
  });

  const [logout] = useMutation<LogoutData, void>(mutations.LOGOUT);

  function handleClickOutside(e: Event) {
    if (e.target instanceof Node && node?.current?.contains(e.target)) return;
    setIsMenuActive(false);
  }

  function toggleMenu() {
    setIsMenuActive(!isMenuActive);
  }

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

  useEffect(() => {
    setIsMobileView(window.matchMedia("(max-width: 576px)").matches);

    function handleWindowResize() {
      setIsMobileView(window.matchMedia("(max-width: 576px)").matches);
    }

    window.addEventListener("resize", handleWindowResize);

    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <div ref={node} className="nav-control">
      <Head>
        <title>
          {notificationCounts > 0
            ? `(${notificationCounts}) Sharinghood`
            : "Sharinghood"}
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="nav-toggle">
        {accessToken && (
          <SVG className="hamburger-icon" icon="bars" onClick={toggleMenu} />
        )}
      </div>
      <div className="nav-logo">
        {data?.communities.find(
          (community) =>
            community.id !== communityIdVar() && community.notificationCount > 0
        ) && <span className="communities-unread" />}
        <Link href={accessToken ? "/posts" : "/"}>
          <a>
            <h1>{data?.community?.name || "Sharinghood"}</h1>
          </a>
        </Link>
        {communityIdVar() && (
          <SVG
            className="caret-icon"
            icon="caretDown"
            onClick={() => {
              localStorage.removeItem("@sharinghood:communityId");
              communityIdVar(null);
              router.push("/communities");
            }}
          />
        )}
      </div>
      <div className="nav-user">
        <div className="nav-user-content">
          {accessToken ? (
            <>
              {!isMobileView && (
                <>
                  <SVG
                    className="nav-icon"
                    icon="user"
                    onClick={() => router.push("/account")}
                  />
                  <SVG
                    className="nav-icon"
                    icon="bell"
                    onClick={() => router.push("/notifications")}
                  />
                  {data?.communities
                    ?.filter((community) => community.id === communityIdVar())
                    .map(
                      (community, idx) =>
                        community.notificationCount > 0 && (
                          <span key={idx} className="notifications-unread">
                            {community.notificationCount}
                          </span>
                        )
                    )}
                </>
              )}
              <SVG
                className="nav-icon"
                icon="signOut"
                onClick={() => {
                  setTimeout(() => {
                    localStorage.removeItem("@sharinghood:communityId");
                    localStorage.removeItem("@sharinghood:accessToken");
                    localStorage.removeItem("@sharinghood:refreshToken");
                    accessTokenVar(null);
                    refreshTokenVar(null);
                    tokenPayloadVar(null);
                    communityIdVar(null);
                  }, 0);
                  logout();
                }}
              />
            </>
          ) : (
            <button type="button" className="login-btn">
              <Link href="/login">Log in</Link>
            </button>
          )}
        </div>
      </div>
      <div className={`nav-menu ${isMenuActive && "active"}`}>
        <Link href="/posts">
          <a className="nav-menu-item" onClick={toggleMenu}>
            Find
          </a>
        </Link>
        <Link href="/posts/create">
          <a className="nav-menu-item" onClick={toggleMenu}>
            Share
          </a>
        </Link>
        <Link href="/requests/create">
          <a className="nav-menu-item" onClick={toggleMenu}>
            Request
          </a>
        </Link>
        {tokenPayload?.isAdmin && (
          <Link href="/dashboard">
            <a className="nav-menu-item dashboard" onClick={toggleMenu}>
              Dashboard
            </a>
          </Link>
        )}
        {isMobileView && (
          <>
            <Link href="/profile">
              <a className="nav-menu-item dashboard" onClick={toggleMenu}>
                Profile
              </a>
            </Link>
            <Link href="/notifications">
              <a className="nav-menu-item dashboard" onClick={toggleMenu}>
                Notifications
              </a>
            </Link>
          </>
        )}
        <div className="nav-menu-item invite">
          <Link href={`/community/${data?.community?.code}/link`}>
            <a className="invite-btn" onClick={toggleMenu}>
              Download Invitation
            </a>
          </Link>
        </div>
      </div>
      <style jsx>
        {`
          @import "../pages/index.scss";

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
              display: flex;
              margin-left: 20px;
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
              }
            }

            .nav-user {
              flex: 1;
              display: flex;
              margin-right: 10px;

              .nav-user-content {
                margin-left: auto;
                display: flex;

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
                  top: 10px;
                  right: 63px;
                  width: 17px;
                  height: 17px;
                  text-align: center;
                  background: $blue;
                  border-radius: 50%;
                  line-height: 17px;
                  font-weight: bold;
                  font-size: 11px;
                  color: #fff;
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
          @import "../pages/index.scss";

          .hamburger-icon {
            width: 20px;
            transform: scale(1.3, 1);
            cursor: pointer;

            @include sm {
              font-size: 19px;
            }
          }

          .nav-icon {
            color: $orange;
            width: 16px;
            border-radius: 50%;
            padding: 12px;
            cursor: pointer;
            margin-left: 10px;

            &:hover {
              background: $grey-100;
            }
          }

          .caret-icon {
            color: $beige;
            margin: auto 12px;
            font-size: 22px;
            cursor: pointer;
            width: 13px;
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
              margin-left: 5px;
              color: $background;
              background: $orange;
            }
          }
        `}
      </style>
    </div>
  );
}
