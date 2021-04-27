import { useState } from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../components/Spinner";
import ServerError from "../components/ServerError";
import { queries } from "../utils/gql";

const FORMATTED_KEYS = {
  _id: "Community ID",
  name: "Community Name",
  code: "Community Code",
  numUsers: "Users",
  numPosts: "Posts",
  numRequests: "Requests",
  numBookings: "Bookings",
};

export default function Dashboard({ location, history }) {
  const { from } = location.state || { from: { pathname: "/" } };
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedCol, setSelectedCol] = useState("_id");
  const [communitiesActivities, setCommunitiesActivities] = useState([]);
  const {
    data: { tokenPayload },
  } = useQuery(queries.LOCAL_TOKEN_PAYLOAD);
  const { loading, error, data } = useQuery(queries.GET_ACTIVITIES, {
    skip: !tokenPayload.isAdmin,
    onCompleted: ({ totalActivities }) => {
      setCommunitiesActivities(totalActivities.communitiesActivities);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  function sortColumns(key) {
    const stats = communitiesActivities.slice();
    stats.sort((a, b) => sortOrder * (a[key] - b[key]));
    setCommunitiesActivities(stats);
    setSelectedCol(key);
    setSortOrder(sortOrder * -1);
  }

  return !tokenPayload.isAdmin ? (
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
            <h1>{data.totalActivities.totalCommunities}</h1>
            <h3>Total Communities</h3>
          </div>
          <div className="dashboard-overview-stats">
            <div className="stat-unclickable">
              <h2>{data.totalActivities.totalUsers}</h2>
              <h4>Total Users</h4>
            </div>
            <div className="stat-unclickable">
              <h2>{data.totalActivities.totalPosts}</h2>
              <h4>Total Posts</h4>
            </div>
            <div className="stat-unclickable">
              <h2>{data.totalActivities.totalRequests}</h2>
              <h4>Total Requests</h4>
            </div>
            <div className="stat-unclickable">
              <h2>{data.totalActivities.totalBookings}</h2>
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

Dashboard.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

Dashboard.defaultProps = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: "/",
      }),
    }),
  }),
};
