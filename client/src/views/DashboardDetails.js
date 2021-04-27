import { useState } from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../components/Spinner";
import { queries } from "../utils/gql";
import { transformImgUrl } from "../utils/helpers";

const STATS_IDS = ["members", "posts", "requests", "bookings"];
const ID_KEYS = ["post", "creator", "booker"];
const DATE_KEYS = ["createdAt", "dateNeed", "dateReturn", "lastLogin"];
const USER_KEYS = ["creator", "booker"];
const ID_SET = new Set(ID_KEYS);
const DATE_SET = new Set(DATE_KEYS);
const USER_SET = new Set(USER_KEYS);
const BOOKING_STATUS = ["Pending", "Accepted", "Denied"];
const FORMATTED_KEYS = {
  _id: "ID",
  post: "Post ID",
  name: "Name",
  email: "Email",
  title: "Title",
  status: "Status",
  booker: "Booker ID",
  image: "Picture",
  creator: "Creator ID",
  desc: "Description",
  condition: "Condition",
  isGiveaway: "Giveaway",
  isNotified: "Notified",
  dateNeed: "Date Needed",
  dateReturn: "Return Date",
  createdAt: "Date Created",
  lastLogin: "Last Login",
};

export default function DashboardDetails({ location, match }) {
  const { from } = location.state || { from: { pathname: "/" } };
  const [selectedId, setSelectedId] = useState("");
  const [selectedCol, setSelectedCol] = useState("_id");
  const [selectedStat, setSelectedStat] = useState("members");
  const {
    data: { tokenPayload },
  } = useQuery(queries.LOCAL_TOKEN_PAYLOAD);
  const { loading, error, data } = useQuery(queries.GET_COMMUNITY_ACTIVITIES, {
    skip: !tokenPayload.isAdmin,
    variables: { communityId: match.params.id },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  // TODO: implement sorting
  function sortColumns(column) {
    setSelectedCol(column);
  }

  // Find selected item in its associated array by id and set it as selected id in state,
  // & set its stat type as selected
  function findById(stat, key) {
    if (USER_SET.has(key)) {
      const targetUser = data.communityActivities.members.filter(
        (member) => member._id === stat[key]._id
      );
      setSelectedId(targetUser[0]._id);
      setSelectedStat("members");
    } else if (key === "post") {
      const targetPost = data.communityActivities.posts.filter(
        (post) => post._id === stat[key]._id
      );
      setSelectedId(targetPost[0]._id);
      setSelectedStat("posts");
    }
  }

  return !tokenPayload.isAdmin ? (
    <Redirect to={from} />
  ) : loading ? (
    <Spinner />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="dashboard-control">
      <div className="dashboard-overview">
        <div className="dashboard-header orange">
          <div className="dashboard-overview-highlight">
            <h2>{data.communityActivities.name} Community</h2>
            <h4>
              ID: {data.communityActivities._id} | Code:{" "}
              {data.communityActivities.code} | Zipcode:{" "}
              {data.communityActivities.zipCode}
            </h4>
          </div>
        </div>
        <div className="dashboard-header grey">
          <div className="dashboard-overview-stats">
            {STATS_IDS.map((stat) => (
              <div
                key={stat}
                className={`stat-clickable ${
                  selectedStat === stat && "active"
                }`}
                onClick={() => setSelectedStat(stat)}
                role="presentation"
              >
                <h2>{data.communityActivities[stat].length}</h2>
                <h4>Total {stat.charAt(0).toUpperCase() + stat.slice(1)}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
      <table>
        <tbody>
          <tr className="dashboard-table-header">
            {Object.keys(
              data.communityActivities[selectedStat].length &&
                data.communityActivities[selectedStat][0]
            )
              .filter((key) => key !== "__typename")
              .map((key) => (
                <th key={key} onClick={() => sortColumns(key)}>
                  {FORMATTED_KEYS[key]}{" "}
                  {selectedCol === key && (
                    <FontAwesomeIcon
                      className="dashboard-sort-icons"
                      icon={faArrowDown}
                      size="1x"
                    />
                  )}
                </th>
              ))}
          </tr>
          {data.communityActivities[selectedStat].map((stat) => (
            <tr
              key={stat._id}
              className={`dashboard-table-row ${
                stat._id === selectedId ? "selected" : undefined
              }`}
            >
              {Object.keys(stat)
                .filter((key) => key !== "__typename")
                .map((key) => (
                  <td
                    key={key}
                    onClick={() => findById(stat, key)}
                    className={ID_SET.has(key) ? "id" : undefined}
                    role="presentation"
                  >
                    {key === "image" ? (
                      <div
                        className="item-img"
                        style={{
                          backgroundImage: `url(${transformImgUrl(
                            JSON.parse(stat[key]).secure_url,
                            150
                          )})`,
                        }}
                      />
                    ) : key === "_id" ? (
                      `...${stat[key].slice(19)}`
                    ) : key === "status" ? (
                      BOOKING_STATUS[stat[key]]
                    ) : ID_SET.has(key) ? (
                      `...${stat[key]._id.slice(19)}`
                    ) : DATE_SET.has(key) ? (
                      moment(+stat[key]).format("MMM DD HH:mm")
                    ) : (
                      stat[key].toString()
                    )}
                  </td>
                ))}
            </tr>
          ))}
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

              .dashboard-header {
                width: 100vw;

                &.orange {
                  background: $orange;
                }

                &.grey {
                  background: $grey-200;
                }

                .dashboard-overview-highlight {
                  margin: auto;
                  color: $background;
                  padding: 10px 0px;
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

                  .stat-clickable {
                    flex: 1;
                    cursor: pointer;
                    background-color: $grey-200;
                    color: $orange;
                    padding: 5px 0px;

                    &.active {
                      background-color: $orange;
                      color: $white;
                    }
                  }
                }
              }
            }

            table {
              text-align: center;
              margin: 0px auto;
              border-collapse: collapse;
              width: $xl-max-width;

              @include lg {
                width: 90vw;
              }

              @include sm {
                width: 100vw;
              }
            }

            .dashboard-table-header {
              height: 40px;
              background-color: white;

              &:hover {
                cursor: pointer;
                background-color: white;
              }
            }

            tr {
              height: 30px;
              background-color: white;

              &.selected {
                animation-name: fade-background;
                animation-duration: 5s;
              }

              &:hover {
                background-color: $grey-200;
              }
            }

            @keyframes fade-background {
              from {
                background-color: $grey-300;
              }
              to {
                background-color: white;
              }
            }

            th {
              color: #000;
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
              color: #000;
              align-items: center;

              &.id {
                &:hover {
                  cursor: pointer;
                  text-decoration: underline;
                }
              }

              .item-img {
                margin: 2px auto;
                width: 40px;
                height: 40px;
                background-size: cover;
                background-position: center;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

DashboardDetails.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

DashboardDetails.defaultProps = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: "/",
      }),
    }),
  }),
};
