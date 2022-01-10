import { useEffect, useRef, ReactNode, Children } from "react";
import Link from "next/link";
import { useApolloClient } from "@apollo/client";
import { queries } from "../lib/gql";
import Members from "../components/Members";
import type {
  PaginatedPostsData,
  PaginatedPostsVars,
  PaginatedRequestsData,
  PaginatedRequestsVars,
} from "../lib/types";
import { MD_WIDTH, ITEMS_LIMIT } from "../lib/const";

type Item = "post" | "request";

interface ItemsGridProps {
  type: Item;
  children: ReactNode;
  communityId: string;
  fetchMore(...args: any): any;
}

export default function ItemsGrid({
  type,
  children,
  fetchMore,
  communityId,
}: ItemsGridProps) {
  const client = useApolloClient();
  const grid = useRef<HTMLDivElement>(null);

  function calcLimit(): number {
    if (!grid.current) return -1;

    const { clientHeight, clientWidth } = grid.current;
    const windowWidth = window.innerWidth;
    const cols = Math.floor(
      windowWidth > MD_WIDTH ? clientWidth / 200 : clientWidth / 230
    );
    const rows =
      Math.ceil(
        windowWidth > MD_WIDTH ? clientHeight / 250 : clientHeight / 274
      ) + 1;

    return cols * rows;
  }

  function getMore(fetchMore: any, offset: number, limit: number): void {
    const items = `${type}s`;
    const paginatedItems = `paginated${
      items.charAt(0).toUpperCase() + items.slice(1)
    }`;

    fetchMore({
      variables: { offset, limit },
      updateQuery(prev: any, { fetchMoreResult }: any) {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          [paginatedItems]: {
            ...fetchMoreResult[paginatedItems],
            [items]: [
              ...prev[paginatedItems][items],
              ...fetchMoreResult[paginatedItems][items],
            ],
          },
        };
      },
    });
  }

  useEffect(() => {
    if (!communityId) return;

    const offset = Children.count(children);
    const limit = calcLimit() - offset;

    if (limit > 0) getMore(fetchMore, offset, limit);
    // eslint-disable-next-line
  }, [communityId]);

  useEffect(() => {
    function handleWindowResize(): void {
      const offset = Children.count(children);
      const limit = calcLimit() - offset;

      if (limit > 0) getMore(fetchMore, offset, limit);
    }

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
    // eslint-disable-next-line
  }, [children]);

  return (
    <div className="items-control" ref={grid}>
      <div className="items-switch">
        <button
          type="button"
          className={`switch-btn ${type === "post" && "active"}`}
        >
          <Link href="/posts">
            <a
              onMouseOver={() => {
                if (communityId)
                  client.query<PaginatedPostsData, PaginatedPostsVars>({
                    query: queries.GET_PAGINATED_POSTS,
                    variables: {
                      offset: 0,
                      limit: ITEMS_LIMIT,
                      communityId: communityId!,
                    },
                  });
              }}
            >
              Shared Items
            </a>
          </Link>
        </button>
        <div className="switch-btn-separator" />
        <button
          type="button"
          className={`switch-btn ${type === "request" && "active"}`}
        >
          <Link href="/requests">
            <a
              onMouseOver={() => {
                if (communityId)
                  client.query<PaginatedRequestsData, PaginatedRequestsVars>({
                    query: queries.GET_PAGINATED_REQUESTS,
                    variables: {
                      offset: 0,
                      limit: ITEMS_LIMIT,
                      communityId: communityId!,
                    },
                  });
              }}
            >
              Requested Items
            </a>
          </Link>
        </button>
      </div>
      <div className="items-content">{children}</div>
      <div className="items-footer">
        Didn&apos;t find what you are looking for?
        <Link href={type === "post" ? "/requests/create" : "/posts/create"}>
          <a>
            {type === "post" ? (
              <button type="button">Request now!</button>
            ) : (
              <button type="button">Share item!</button>
            )}
          </a>
        </Link>
      </div>
      <Members />
      <style jsx>
        {`
          @import "../pages/index.scss";

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
