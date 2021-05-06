import { useState } from "react";
import { Location, History } from "history";
import { Redirect } from "react-router-dom";
import { useQuery, useReactiveVar } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../components/Spinner";
import ServerError from "../components/ServerError";
import { queries } from "../utils/gql";
import { typeDefs } from "../utils/typeDefs";
import { tokenPayloadVar } from "../utils/cache";

interface FormattedKeys {
  [key: string]: string;
}

const FORMATTED_KEYS: FormattedKeys = {
  _id: "Community ID",
  name: "Community Name",
  code: "Community Code",
  numUsers: "Users",
  numPosts: "Posts",
  numRequests: "Requests",
  numBookings: "Bookings",
};

interface IndexableCommunityActivities extends typeDefs.CommunityActivities {
  [key: string]: any;
}

type State = { from: { pathname: string } };

interface DashboardProps {
  location: Location<State>;
  history: History;
}

export default function Dashboard({ location, history }: DashboardProps) {
  const { from } = location.state || { from: { pathname: "/" } };
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedCol, setSelectedCol] = useState("_id");
  const [communitiesActivities, setCommunitiesActivities] = useState<
    Array<IndexableCommunityActivities>
  >([]);
  const { loading, error, data } = useQuery<typeDefs.TotalActivitiesData, void>(
    queries.GET_TOTAl_ACTIVITIES,
    {
      skip: !tokenPayload || !tokenPayload.isAdmin,
      onCompleted: ({ totalActivities }) => {
        setCommunitiesActivities(totalActivities.communitiesActivities);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    }
  );

  function sortColumns(column: string): void {
    // Copy communitiesActivities
    const stats = communitiesActivities.slice();

    // Sort string elements
    if (typeof stats[0][column] === "string") {
      stats.sort((a, b) => {
        const elemA = a[column].toUpperCase();
        const elemB = b[column].toUpperCase();
        if (elemA < elemB) return sortOrder * -1;
        if (elemA > elemB) return sortOrder * 1;
        return 0;
      });
    }

    // Sort number elements
    stats.sort((a, b) => sortOrder * (a[column] - b[column]));

    setCommunitiesActivities(stats);
    setSelectedCol(column);
    setSortOrder(sortOrder * -1);
  }

  return !tokenPayload || !tokenPayload.isAdmin ? (
    <Redirect to={from} />
  ) : loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <div className="dashboard-control">
      <div className="dashboard-overview">
        <div className="dashboard-header">
          <div className="dashboard-overview-highlight">
            <h1>{data?.totalActivities.totalCommunities}</h1>
            <h3>Total Communities</h3>
          </div>
          <div className="dashboard-overview-stats">
            <div className="stat-unclickable">
              <h2>{data?.totalActivities.totalUsers}</h2>
              <h4>Total Users</h4>
            </div>
            <div className="stat-unclickable">
              <h2>{data?.totalActivities.totalPosts}</h2>
              <h4>Total Posts</h4>
            </div>
            <div className="stat-unclickable">
              <h2>{data?.totalActivities.totalRequests}</h2>
              <h4>Total Requests</h4>
            </div>
            <div className="stat-unclickable">
              <h2>{data?.totalActivities.totalBookings}</h2>
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
                    <th key={key} onClick={() => sortColumns(key)}>
                      {FORMATTED_KEYS[key]}{" "}
                      {selectedCol === key && (
                        <FontAwesomeIcon
                          className="dashboard-sort-icons"
                          icon={sortOrder === -1 ? faArrowUp : faArrowDown}
                          size="1x"
                        />
                      )}
                    </th>
                  ))
              : null}
          </tr>
        </thead>
        <tbody>
          {communitiesActivities.length
            ? communitiesActivities.map((communityActivities) => (
                <tr
                  key={communityActivities._id}
                  className="dashboard-table-row"
                  onClick={() => {
                    history.push(`/dashboard/${communityActivities._id}`);
                  }}
                >
                  <td>{communityActivities._id}</td>
                  <td>{communityActivities.name}</td>
                  <td>{communityActivities.code}</td>
                  <td>{communityActivities.numUsers}</td>
                  <td>{communityActivities.numPosts}</td>
                  <td>{communityActivities.numRequests}</td>
                  <td>{communityActivities.numBookings}</td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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

              .dashboard-sort-icons {
                font-size: 12px;
                padding-left: 8px;
              }

              &:hover {
                background-color: $grey-200;
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
    </div>
  );
}
