import Link from "next/link";
import moment from "moment";
import { useQuery, useReactiveVar } from "@apollo/client";
import { Container, SVG } from "../../components/Container";
import ItemsGrid from "../../components/ItemGrid";
import { communityIdVar } from "../_app";
import { queries } from "../../lib/gql";
import { transformImgUrl } from "../../lib";
import type { RequestsData, RequestsVars } from "../../lib/types";

export default function Requests() {
  const communityId = useReactiveVar(communityIdVar);
  const { loading, error, data, client, fetchMore } = useQuery<
    RequestsData,
    RequestsVars
  >(queries.GET_REQUESTS, {
    skip: !communityId,
    variables: { offset: 0, limit: 10, communityId: communityId! },
    onError: ({ message }) => {
      console.warn(message);
    },
  });

  return (
    <Container loading={loading} error={error}>
      <ItemsGrid type="request" communityId={communityId!}>
        {data?.requests.map((request) => (
          <div key={request.id} className="item-card">
            <Link href={`/requests/${request.id}`}>
              <a
                onMouseOver={() => {
                  client.query({
                    query: queries.GET_REQUEST_DETAILS,
                    variables: {
                      requestId: request.id,
                      communityId: communityId!,
                    },
                  });
                }}
              >
                <div
                  className="item-img"
                  style={{
                    backgroundImage: `url(${transformImgUrl(
                      request.imageUrl,
                      300
                    )})`,
                  }}
                />
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
        <button
          onClick={() => {
            fetchMore({
              variables: {
                offset: data?.requests.length,
                limit: 10,
                communityId: communityId!,
              },
            });
          }}
        >
          More
        </button>
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
                background-size: cover;
                background-position: center;

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
      </ItemsGrid>
    </Container>
  );
}
