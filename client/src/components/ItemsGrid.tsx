import { ReactNode } from "react";
import { useApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import { queries, Post, Request } from "../utils/gql";
import Members from "./Members";

export default function ItemsGrid({
  isPost,
  children,
  communityId,
}: {
  isPost: boolean;
  children: ReactNode;
  communityId: string;
}) {
  const client = useApolloClient();

  return (
    <div className="items-control">
      <div className="items-switch">
        <button type="button" className={`switch-btn ${isPost && "active"}`}>
          <Link
            to="/find"
            onMouseOver={() => {
              client.query<{ posts: Array<Post> }, { communityId: string }>({
                query: queries.GET_POSTS,
                variables: { communityId },
              });
            }}
          >
            Items People Share
          </Link>
        </button>
        <div className="switch-btn-separator" />
        <button type="button" className={`switch-btn ${!isPost && "active"}`}>
          <Link
            to="requests"
            onMouseOver={() => {
              client.query<
                { requests: Array<Request> },
                { communityId: string }
              >({
                query: queries.GET_REQUESTS,
                variables: { communityId },
              });
            }}
          >
            Items People Request
          </Link>
        </button>
      </div>
      <div className="items-content">{children}</div>
      <div className="items-footer">
        Didn&apos;t find what you are looking for?
        <Link to={isPost ? "/request" : "/share"}>
          {isPost ? (
            <button type="button">Request now!</button>
          ) : (
            <button type="button">Share item!</button>
          )}
        </Link>
      </div>
      <Members />
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .items-control {
            margin: 30px auto;
            width: 80vw;
            max-width: $xl-max-width;

            .items-switch {
              margin: auto;
              display: flex;
              max-width: 500px;
              justify-content: space-between;
            }

            .items-content {
              margin: 10px auto 50px auto;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-evenly;
            }

            .items-footer {
              width: calc(100% - 20px);
              max-width: 520px;
              height: 50px;
              display: flex;
              position: fixed;
              bottom: 0;
              align-items: center;
              justify-content: space-around;
              left: 50%;
              margin-left: -260px;
              border-width: 0;
              border-top-left-radius: 1px;
              border-top-right-radius: 1px;
              box-shadow: 0px 0px 8px $grey-300;
              background: $grey-100;
              color: $black;
              font-size: 16px;

              @include sm {
                font-size: 14px;
                left: 0;
                margin: 0;
                padding-left: 10px;
                padding-right: 10px;
              }

              button {
                width: 160px;
                height: 70%;
                display: block;
                background: $orange;
                border-width: 0;
                border-radius: 4px;
                cursor: pointer;
                color: $background;
                font-size: 18px;
                padding: 4px 2px;

                @include sm {
                  width: 100px;
                  font-size: 14px;
                }
              }
            }
          }
        `}
      </style>
    </div>
  );
}
