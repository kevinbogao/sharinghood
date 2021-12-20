import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import moment, { Moment } from "moment";
import { queries } from "../../lib/gql";
import { types } from "../../lib/types";
import { transformImgUrl } from "../../lib";
import { tokenPayloadVar } from "../_app";
import { Container, SVG } from "../../components/Container";
import { TimeFrame, BookingStatus } from "../../lib/types";

const STATS_IDS = ["members", "posts", "requests", "bookings"];
const ID_SET = new Set(["post", "creator", "booker"]);
const DATE_SET = new Set(["createdAt", "dateNeed", "dateReturn", "lastLogin"]);
const USER_SET = new Set(["creator", "booker"]);
const FORMATTED_KEYS: Record<string, string> = {
  id: "ID",
  post: "Post ID",
  name: "Name",
  email: "Email",
  title: "Title",
  status: "Status",
  booker: "Booker ID",
  imageUrl: "Picture",
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

const BOOKING_STATUS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.ACCEPTED]: "Accepted",
  [BookingStatus.DECLINED]: "Denied",
};

export default function CommunityActivities() {
  const router = useRouter();
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCol, setSelectedCol] = useState("id");
  const [selectedStat, setSelectedStat] = useState("members");
  const [selectedStatActivities, setSelectedStatActivities] = useState<
    Array<any>
  >([]);

  useEffect(() => {
    if (!tokenPayload?.isAdmin) router.replace("/posts");
    // eslint-disable-next-line
  }, [tokenPayload]);

  const { loading, error, data } = useQuery<
    types.CommunityActivitiesData,
    types.CommunityActivitiesVars
  >(queries.GET_COMMUNITY_ACTIVITIES, {
    skip: !tokenPayload?.isAdmin || !router.query.id,
    variables: { communityId: router.query.id?.toString()! },
    onCompleted({ communityActivities }) {
      setSelectedStatActivities(communityActivities["members"]);
    },
    onError({ message }) {
      console.log(message);
    },
  });

  // console.log(data);

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

  function formatTime(timeFrame: TimeFrame, timeString: Date): string | Moment {
    if (timeFrame === TimeFrame.ASAP) return "ASAP";
    else if (timeFrame === TimeFrame.RANDOM) return "N/A";
    return moment(+timeString).format("MMM DD HH:mm");
  }

  // Find selected item in its associated array by id and set it as selected id in state,
  // & set its stat type as selected
  function findById(stat: any, key: string): void {
    if (USER_SET.has(key)) {
      const targetUser = data!.communityActivities.members.filter(
        (member: types.User) => member.id === stat[key].id
      );
      setSelectedId(targetUser[0].id);
      setSelectedStat("members");
      setSelectedStatActivities(data!.communityActivities["members"]);
    } else if (key === "post") {
      const targetPost = data!.communityActivities.posts.filter(
        (post: types.Post) => post.id === stat[key].id
      );
      setSelectedId(targetPost[0].id);
      setSelectedStat("posts");
      setSelectedStatActivities(data!.communityActivities["posts"]);
    }
  }

  return (
    <Container auth={false} community={false} loading={loading} error={error}>
      <div className="dashboard-control">
        <div className="dashboard-overview">
          <div className="dashboard-header orange">
            <div className="dashboard-overview-highlight">
              <h2>{data?.communityActivities.name} Community</h2>
              <h4>
                ID: {data?.communityActivities.id} | Code:{" "}
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
                  <h2>{data?.communityActivities[stat].length}</h2>
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
                .filter((key) => key !== "__typename" && key !== "timeFrame")
                .map((key) => (
                  <th key={key} onClick={() => sortColumns(key)}>
                    <div className="tr-title">
                      {FORMATTED_KEYS[key]}{" "}
                      {selectedCol === key && (
                        <SVG
                          className="dashboard-sort-icons"
                          icon={sortOrder === -1 ? "angleUp" : "angleDown"}
                        />
                      )}
                    </div>
                  </th>
                ))}
            </tr>
            {selectedStatActivities.map((stat) => (
              <tr
                key={stat.id}
                className={`dashboard-table-row ${
                  stat.id === selectedId ? "selected" : undefined
                }`}
              >
                {Object.keys(stat)
                  .filter((key) => key !== "__typename" && key !== "timeFrame")
                  .map((key) => (
                    <td
                      key={key}
                      onClick={() => findById(stat, key)}
                      className={ID_SET.has(key) ? "id" : undefined}
                      role="presentation"
                    >
                      {key === "imageUrl" ? (
                        <div className="item-img">
                          <Image
                            alt="profile pic"
                            src={
                              stat[key]
                                ? transformImgUrl(stat[key], 150)
                                : "/profile-img.png"
                            }
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      ) : key === "id" ? (
                        `...${stat[key].slice(19)}`
                      ) : key === "status" ? (
                        BOOKING_STATUS[stat[key] as BookingStatus]
                      ) : ID_SET.has(key) ? (
                        `...${stat[key].id.slice(19)}`
                      ) : DATE_SET.has(key) ? (
                        formatTime(stat.timeFrame, stat[key])
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

                .tr-title {
                  display: flex;
                  align-items: center;
                  justify-content: center;
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
                  position: relative;
                  background-size: cover;
                  background-position: center;
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
