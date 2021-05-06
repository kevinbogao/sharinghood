import { useState } from "react";
import { Location } from "history";
import { Redirect, match } from "react-router-dom";
import { useQuery, useReactiveVar } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment, { Moment } from "moment";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../components/Spinner";
import ServerError from "../components/ServerError";
import { queries } from "../utils/gql";
import { typeDefs } from "../utils/typeDefs";
import { tokenPayloadVar } from "../utils/cache";
import { transformImgUrl } from "../utils/helpers";

interface FormattedKeys {
  [key: string]: string;
}

const STATS_IDS = ["members", "posts", "requests", "bookings"];
const ID_SET = new Set(["post", "creator", "booker"]);
const DATE_SET = new Set(["createdAt", "dateNeed", "dateReturn", "lastLogin"]);
const USER_SET = new Set(["creator", "booker"]);
const BOOKING_STATUS = ["Pending", "Accepted", "Denied"];
const FORMATTED_KEYS: FormattedKeys = {
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

type State = { from: { pathname: string } };

interface DashboardDetailsProps {
  location: Location<State>;
  match: match<{ id: string }>;
}

export default function DashboardDetails({
  location,
  match,
}: DashboardDetailsProps) {
  const { from } = location.state || { from: { pathname: "/" } };
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCol, setSelectedCol] = useState("_id");
  const [selectedStat, setSelectedStat] = useState("members");
  const [selectedStatActivities, setSelectedStatActivities] = useState<
    Array<any>
  >([]);
  const { loading, error, data } = useQuery<
    typeDefs.CommunityActivitiesData,
    typeDefs.CommunityActivitiesVars
  >(queries.GET_COMMUNITY_ACTIVITIES, {
    skip: !tokenPayload || !tokenPayload.isAdmin,
    variables: { communityId: match.params.id },
    onCompleted: ({ communityActivities }) => {
      setSelectedStatActivities(communityActivities["members"]);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  function sortColumns(column: string): void {
    const stats = selectedStatActivities.slice();
    if (typeof stats[0][column] === "string") {
      stats.sort((a, b) => {
        const elemA = a[column].toUpperCase();
        const elemB = b[column].toUpperCase();
        if (elemA < elemB) return sortOrder * -1;
        if (elemA > elemB) return sortOrder * 1;
        return 0;
      });
    }
    stats.sort((a, b) => sortOrder * (a[column] - b[column]));
    setSelectedStatActivities(stats);
    setSelectedCol(column);
    setSortOrder(sortOrder * -1);
  }

  function formatTime(dateType: number, timeString: Date): string | Moment {
    if (dateType === 0) return "ASAP";
    else if (dateType === 1) return "N/A";
    return moment(+timeString).format("MMM DD HH:mm");
  }

  // Find selected item in its associated array by id and set it as selected id in state,
  // & set its stat type as selected
  function findById(stat: any, key: string): void {
    if (USER_SET.has(key)) {
      const targetUser = data!.communityActivities.members.filter(
        (member: typeDefs.User) => member._id === stat[key]._id
      );
      setSelectedId(targetUser[0]._id);
      setSelectedStat("members");
      setSelectedStatActivities(data!.communityActivities["members"]);
    } else if (key === "post") {
      const targetPost = data!.communityActivities.posts.filter(
        (post: typeDefs.Post) => post._id === stat[key]._id
      );
      setSelectedId(targetPost[0]._id);
      setSelectedStat("posts");
      setSelectedStatActivities(data!.communityActivities["posts"]);
    }
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
        <div className="dashboard-header orange">
          <div className="dashboard-overview-highlight">
            <h2>{data?.communityActivities.name} Community</h2>
            <h4>
              ID: {data?.communityActivities._id} | Code:{" "}
              {data?.communityActivities.code} | Zipcode:{" "}
              {data?.communityActivities.zipCode}
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
                onClick={() => {
                  setSelectedStat(stat);
                  //  @ts-ignore
                  setSelectedStatActivities(data?.communityActivities[stat]);
                }}
                role="presentation"
              >
                {/* @ts-ignore */}
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
              selectedStatActivities.length && selectedStatActivities[0]
            )
              .filter((key) => key !== "__typename" && key !== "dateType")
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
              ))}
          </tr>
          {selectedStatActivities.map((stat) => (
            <tr
              key={stat._id}
              className={`dashboard-table-row ${
                stat._id === selectedId ? "selected" : undefined
              }`}
            >
              {Object.keys(stat)
                .filter((key) => key !== "__typename" && key !== "dateType")
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
                      formatTime(stat.dateType, stat[key])
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
