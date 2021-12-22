import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { tokenPayloadVar } from "../_app";
import { types } from "../../lib/types";
import { queries } from "../../lib/gql";
import { Container, SVG } from "../../components/Container";

type TKeys = keyof types.CommunitiesActivities;

const FORMATTED_KEYS: Record<TKeys, string> = {
  id: "Community ID",
  name: "Community Name",
  code: "Community Code",
  membersCount: "Members",
  postsCount: "Posts",
  requestsCount: "Requests",
  bookingsCount: "Bookings",
};

export default function Dashboard() {
  const router = useRouter();
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedCol, setSelectedCol] = useState("id");
  const [communitiesActivities, setCommunitiesActivities] = useState<
    types.CommunitiesActivities[]
  >([]);

  const { loading, error, data } = useQuery<types.TotalActivitiesData, void>(
    queries.GET_TOTAl_ACTIVITIES,
    {
      skip: !tokenPayload?.isAdmin,
      onCompleted({ totalActivities }) {
        setCommunitiesActivities(totalActivities.communitiesActivities);
      },
    }
  );

  useEffect(() => {
    if (!tokenPayload?.isAdmin) router.replace("/posts");
    // eslint-disable-next-line
  }, [tokenPayload]);

  function sortColumns(column: TKeys): void {
    const stats = communitiesActivities.slice();

    // Sort string elements
    if (typeof stats[0][column] === "string") {
      stats.sort((a, b) => {
        const elemA = (a[column] as string).toUpperCase();
        const elemB = (b[column] as string).toUpperCase();
        if (elemA < elemB) return sortOrder * -1;
        if (elemA > elemB) return sortOrder * 1;
        return 0;
      });
    }

    // Sort number elements
    stats.sort(
      (a, b) => sortOrder * ((a[column] as number) - (b[column] as number))
    );

    setCommunitiesActivities(stats);
    setSelectedCol(column);
    setSortOrder(sortOrder * -1);
  }

  console.log(data);

  return (
    <Container auth={false} loading={loading} error={error}>
      <div className="dashboard-control">
        <div className="dashboard-overview">
          <div className="dashboard-header">
            <div className="dashboard-overview-highlight">
              <h1>{data?.totalActivities.totalCommunitiesCount}</h1>
              <h3>Total Communities</h3>
            </div>
            <div className="dashboard-overview-stats">
              <div className="stat-unclickable">
                <h2>{data?.totalActivities.totalUsersCount}</h2>
                <h4>Total Users</h4>
              </div>
              <div className="stat-unclickable">
                <h2>{data?.totalActivities.totalPostsCount}</h2>
                <h4>Total Posts</h4>
              </div>
              <div className="stat-unclickable">
                <h2>{data?.totalActivities.totalRequestsCount}</h2>
                <h4>Total Requests</h4>
              </div>
              <div className="stat-unclickable">
                <h2>{data?.totalActivities.totalBookingsCount}</h2>
                <h4>Total Bookings</h4>
              </div>
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr className="dashboard-table-header">
              {communitiesActivities.length
                ? Object.keys(communitiesActivities[0])
                    .filter((key) => key !== "__typename")
                    .map((key) => (
                      <th key={key} onClick={() => sortColumns(key as TKeys)}>
                        <div className="tr-title">
                          {FORMATTED_KEYS[key as TKeys]}{" "}
                          {selectedCol === key && (
                            <SVG
                              className="dashboard-sort-icons"
                              icon={sortOrder === -1 ? "angleUp" : "angleDown"}
                            />
                          )}
                        </div>
                      </th>
                    ))
                : null}
            </tr>
          </thead>
          <tbody>
            {communitiesActivities.length
              ? communitiesActivities.map((communityActivities) => (
                  <tr
                    key={communityActivities.id}
                    className="dashboard-table-row"
                    onClick={() =>
                      router.push(`/dashboard/${communityActivities.id}`)
                    }
                  >
                    <td>{communityActivities.id}</td>
                    <td>{communityActivities.name}</td>
                    <td>{communityActivities.code}</td>
                    <td>{communityActivities.membersCount}</td>
                    <td>{communityActivities.postsCount}</td>
                    <td>{communityActivities.requestsCount}</td>
                    <td>{communityActivities.bookingsCount}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        <style jsx>
          {`
            @import "../index.scss";

            .dashboard-control {
              margin: 0 auto auto auto;
              width: 100vw;

              h1,
              h2,
              h3,
              h4 {
                margin: 2px;
                font-weight: bold;
                letter-spacing: 1px;
              }

              .dashboard-overview {
                margin: 0 auto;
                text-align: center;
                color: $background;

                .dashboard-header {
                  width: 100vw;
                  background: $orange;
                }

                .dashboard-overview-highlight {
                  padding: 10px 0px;
                  margin: auto;
                  width: $xl-max-width;

                  @include lg {
                    width: 90vw;
                  }

                  @include sm {
                    width: 100vw;
                  }
                }

                .dashboard-overview-stats {
                  margin: auto;
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: space-around;
                  align-items: center;
                  width: $xl-max-width;

                  @include lg {
                    width: 90vw;
                  }

                  @include sm {
                    width: 100vw;
                  }
                }
              }

              table {
                width: $xl-max-width;

                @include lg {
                  width: 90vw;
                }

                @include sm {
                  width: 100vw;
                }

                text-align: center;
                margin: 0px auto;
                border-collapse: collapse;
              }

              .dashboard-table-header {
                height: 40px;
                background-color: white;

                &:hover {
                  background-color: white;
                }
              }

              tr {
                height: 30px;
                background-color: white;
                cursor: pointer;

                &:hover {
                  background-color: $grey-200;
                }
              }

              th {
                align-items: center;

                .tr-title {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              }

              td {
                align-items: center;

                img {
                  width: 40px;
                  height: 40px;
                }
              }
            }
          `}
        </style>
        <style jsx global>
          {`
            .dashboard-sort-icons {
              color: #000;
              width: 11px;
              right: 0px;
              margin-left: 6px;
              cursor: pointer;
            }
          `}
        </style>
      </div>
    </Container>
  );
}