import { useEffect, RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import { useQuery, useReactiveVar } from "@apollo/client";
import { Container, SVG } from "../../components/Container";
import ItemsGrid from "../../components/ItemGrid";
import { communityIdVar } from "../_app";
import { queries } from "../../lib/gql";
import { transformImgUrl } from "../../lib";
import { ITEMS_LIMIT, THREADS_LIMIT } from "../../lib/const";
import type {
  RequestDetailsData,
  RequestDetailsVars,
  PaginatedRequestsData,
  PaginatedRequestsVars,
} from "../../lib/types";

interface RequestsProps {
  parent: RefObject<HTMLDivElement>;
}

export default function Requests({ parent }: RequestsProps) {
  const communityId = useReactiveVar(communityIdVar);

  const { loading, error, data, client, fetchMore } = useQuery<
    PaginatedRequestsData,
    PaginatedRequestsVars
  >(queries.GET_PAGINATED_REQUESTS, {
    skip: !communityId,
    variables: { offset: 0, limit: ITEMS_LIMIT, communityId: communityId! },
    onError: ({ message }) => {
      console.warn(message);
    },
  });

  function onScroll() {
    if (parent.current) {
      const { scrollTop, scrollHeight, clientHeight } = parent.current;
      if (scrollTop + clientHeight === scrollHeight) {
        if (!data?.paginatedRequests.hasMore) return;
        fetchMore<PaginatedRequestsData, PaginatedRequestsVars>({
          variables: {
            offset: data?.paginatedRequests.requests.length,
            limit: 10,
          },
          updateQuery(prev, { fetchMoreResult }) {
            if (!fetchMoreResult) return prev;
            return {
              ...prev,
              paginatedRequests: {
                ...fetchMoreResult.paginatedRequests,
                requests: [
                  ...prev.paginatedRequests.requests,
                  ...fetchMoreResult.paginatedRequests.requests,
                ],
              },
            };
          },
        });
      }
    }
  }

  useEffect(() => {
    let node: HTMLDivElement | null = null;

    if (parent.current) {
      node = parent.current;
      node.addEventListener("scroll", onScroll);
    }

    return () => {
      if (node) node.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line
  }, [data]);

  return (
    <Container loading={loading} error={error}>
      <ItemsGrid
        type="request"
        fetchMore={fetchMore}
        communityId={communityId!}
      >
        {data?.paginatedRequests.requests.map((request) => (
          <div key={request.id} className="item-card">
            <Link href={`/requests/${request.id}`}>
              <a
                onMouseOver={() => {
                  client.query<RequestDetailsData, RequestDetailsVars>({
                    query: queries.GET_REQUEST_DETAILS,
                    variables: {
                      requestId: request.id,
                      communityId: communityId!,
                      threadsOffset: 0,
                      threadsLimit: THREADS_LIMIT,
                    },
                  });
                }}
              >
                <div className="item-img">
                  <Image
                    alt="profile pic"
                    src={transformImgUrl(request.imageUrl, 300)}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="item-info">
                  <p className="item-title">{request.title}</p>
                  <p>by {request.creator.name}</p>
                  <div className="item-needed-on">
                    <SVG className="clock-icon" icon="clock" />
                    <span className="item-user">
                      {request.timeFrame === "asap"
                        ? "ASAP"
                        : request.timeFrame === "random"
                        ? "Anytime"
                        : moment(+request.dateNeed).format("MMM DD")}
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </ItemsGrid>
      <style jsx>
        {`
          @import "../index.scss";

          .item-card {
            background: $grey-100;
            margin: 20px 10px;
            padding: 10px;
            cursor: pointer;

            &:hover {
              background: $grey-200;
            }

            p {
              color: $black;
              font-size: 14px;
              width: 160px;

              &.item-title {
                margin-top: 10px;
                margin-bottom: 5px;
                font-size: 18px;
              }
            }

            .item-img {
              width: 160px;
              height: 136px;
              position: relative;

              @include md {
                width: 190px;
                height: 160px;
              }

              @include sm {
                width: 250px;
                height: 200px;
              }
            }

            .item-needed-on {
              margin-top: 5px;
              display: flex;
              align-items: center;
              font-size: 15px;
              color: $beige;

              span {
                font-size: 14px;
                margin-left: 6px;
              }
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          .clock-icon {
            width: 14px;
          }
        `}
      </style>
    </Container>
  );
}
