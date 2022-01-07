import { useState, useRef, useEffect, RefObject } from "react";
import moment, { Moment } from "moment";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import { queries } from "../../lib/gql";
import { tokenPayloadVar } from "../_app";
import { Container, SVG } from "../../components/Container";
import { TimeFrame, BookingStatus } from "../../lib/enums";
import type {
  CommunityActivitiesData,
  CommunityActivitiesVars,
} from "../../lib/types";
import { transformImgUrl } from "../../lib";

const IDS = ["post", "creator", "booker"];
const IGNORED_KEYS = ["__typename", "timeFrame"];
const USER_TYPES = ["creator", "booker"];
const DATES = ["createdAt", "dateNeed", "dateReturn", "lastLogin"];
const BOOKING_STATUS: Record<string, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.ACCEPTED]: "Accepted",
  [BookingStatus.DECLINED]: "Denied",
};
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

type ActivityKey =
  | "paginatedMembers"
  | "paginatedPosts"
  | "paginatedRequests"
  | "paginatedBookings";

const SELECTOR: Record<ActivityKey, string> = {
  paginatedMembers: "users",
  paginatedPosts: "posts",
  paginatedRequests: "requests",
  paginatedBookings: "bookings",
};

interface CommunityDashboardProps {
  parent: RefObject<HTMLDivElement>;
}

export default function CommunityDashboard({
  parent,
}: CommunityDashboardProps) {
  const router = useRouter();
  const table = useRef<HTMLDivElement>(null);
  const tokenPayload = useReactiveVar(tokenPayloadVar);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState(-1);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCol, setSelectedCol] = useState("id");
  const [selectedKey, setSelectedKey] =
    useState<ActivityKey>("paginatedMembers");
  const [selectedActivity, setSelectedActivity] = useState<any>();

  useEffect(() => {
    if (!tokenPayload?.isAdmin) router.replace("/posts");
    // eslint-disable-next-line
  }, [tokenPayload]);

  useEffect(() => {
    if (parent.current) {
      const { clientHeight } = parent.current;
      const rows = Math.floor((clientHeight - 136 - 40) / 44) + 5;
      setLimit(rows > 10 ? rows : 10);
    }
    // eslint-disable-next-line
  }, []);

  const { loading, error, data, fetchMore } = useQuery<
    CommunityActivitiesData,
    CommunityActivitiesVars
  >(queries.GET_COMMUNITY_ACTIVITIES, {
    skip: !tokenPayload?.isAdmin || !router.query.id,
    variables: {
      communityId: router.query.id?.toString()!,
      postsOffset: 0,
      postsLimit: limit,
      membersOffset: 0,
      membersLimit: limit,
      requestsOffset: 0,
      requestsLimit: limit,
      bookingsOffset: 0,
      bookingsLimit: limit,
    },
    onCompleted({ communityActivities }) {
      setSelectedActivity(communityActivities[selectedKey]);
    },
    onError({ message }) {
      console.log(message);
    },
  });

  const QUERY_VARIABLES = {
    postsLimit: 0,
    membersLimit: 0,
    requestsLimit: 0,
    bookingsLimit: 0,
  };

  function onScroll() {
    if (table.current) {
      const { scrollTop, scrollHeight, clientHeight } = table.current;
      if (scrollTop + clientHeight === scrollHeight) {
        if (!data?.communityActivities[selectedKey].hasMore) return;

        const entity = SELECTOR[selectedKey];
        const offset = `${entity}Offset`;
        const limit = `${entity}Limit`;

        fetchMore({
          variables: {
            ...QUERY_VARIABLES,
            // @ts-ignore
            [offset]: data?.communityActivities[selectedKey][entity].length,
            [limit]: 10,
          },

          // @ts-ignore
          updateQuery(prev, { fetchMoreResult }) {
            if (!fetchMoreResult) return prev;

            return {
              ...prev,
              communityActivities: {
                ...prev.communityActivities,
                [selectedKey]: {
                  ...prev.communityActivities[selectedKey],
                  [entity]: [
                    // @ts-ignore
                    ...prev.communityActivities[selectedKey][entity],
                    // @ts-ignore
                    ...fetchMoreResult.communityActivities[selectedKey][entity],
                  ],
                  hasMore:
                    fetchMoreResult.communityActivities[selectedKey].hasMore,
                },
              },
            };
          },
        });
      }
    }
  }

  useEffect(() => {
    let node: HTMLDivElement | null = null;

    if (table.current) {
      node = table.current;
      node.addEventListener("scroll", onScroll);
    }

    return () => {
      if (node) node.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line
  }, [data, selectedKey]);

  function sortColumns(column: string): void {
    const stats = selectedActivity[SELECTOR[selectedKey]].slice();

    if (typeof stats[0][column] === "string") {
      stats.sort((a: any, b: any) => {
        const elemA = a[column].toUpperCase();
        const elemB = b[column].toUpperCase();
        if (elemA < elemB) return sortOrder * -1;
        if (elemA > elemB) return sortOrder * 1;
        return 0;
      });
    }
    stats.sort((a: any, b: any) => sortOrder * (a[column] - b[column]));
    setSelectedActivity({ ...setSelectedKey, [SELECTOR[selectedKey]]: stats });
    setSelectedCol(column);
    setSortOrder(sortOrder * -1);
  }

  function formatDate(timeFrame: TimeFrame, timeString: Date): string | Moment {
    if (timeFrame === TimeFrame.ASAP) return "ASAP";
    else if (timeFrame === TimeFrame.RANDOM) return "N/A";
    return moment(+timeString).format("MMM DD HH:mm");
  }

  function findById(entity: any, key: string): void {
    if (USER_TYPES.includes(key)) {
      const user = data!.communityActivities.paginatedMembers.users.find(
        (user) => user.id === entity[key].id
      );
      if (!user) return;
      setSelectedId(user.id);
      setSelectedKey("paginatedMembers");
      setSelectedActivity(data!.communityActivities.paginatedMembers);
    } else if (key === "post") {
      const post = data!.communityActivities.paginatedPosts.posts.find(
        (post) => post.id === entity[key].id
      );
      if (!post) return;
      setSelectedId(post.id);
      setSelectedKey("paginatedPosts");
      setSelectedActivity(data!.communityActivities.paginatedPosts);
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
              {Object.entries(SELECTOR).map(([key, value]) => (
                <div
                  key={key}
                  className={`stat-clickable ${
                    selectedKey === key && "active"
                  }`}
                  role="presentation"
                  onClick={() => {
                    setSelectedKey(key as ActivityKey);
                    setSelectedActivity(
                      data?.communityActivities[key as ActivityKey]
                    );
                  }}
                >
                  <h2>
                    {data?.communityActivities[key as ActivityKey].totalCount}
                  </h2>
                  <h4>
                    Total {value.charAt(0).toUpperCase() + value.slice(1)}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dashboard-table" ref={table}>
          <table>
            <thead>
              <tr className="dashboard-table-header">
                {selectedActivity &&
                  selectedActivity[SELECTOR[selectedKey]][0] &&
                  Object.keys(selectedActivity[SELECTOR[selectedKey]][0])
                    .filter((key) => !IGNORED_KEYS.includes(key))
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
            </thead>
            <tbody>
              {selectedActivity &&
                selectedActivity[SELECTOR[selectedKey]] &&
                selectedActivity[SELECTOR[selectedKey]].map((entity: any) => (
                  <tr
                    key={entity.id}
                    className={`dashboard-table-row ${
                      entity.id === selectedId ? "selected" : undefined
                    }`}
                  >
                    {Object.keys(entity)
                      .filter((key) => !IGNORED_KEYS.includes(key))
                      .map((key) => (
                        <td
                          key={key}
                          onClick={() => findById(entity, key)}
                          className={IDS.includes(key) ? "id" : undefined}
                          role="presentation"
                        >
                          {key === "imageUrl" ? (
                            <div className="item-img">
                              <Image
                                alt="profile pic"
                                src={
                                  entity[key]
                                    ? transformImgUrl(entity[key], 150)
                                    : "/profile-img.png"
                                }
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                          ) : key === "id" ? (
                            `...${entity[key].slice(19)}`
                          ) : key === "status" ? (
                            BOOKING_STATUS[entity[key]]
                          ) : IDS.includes(key) ? (
                            `...${entity[key].id.slice(19)}`
                          ) : DATES.includes(key) ? (
                            formatDate(entity.timeFrame, entity[key])
                          ) : (
                            entity[key].toString()
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>
        {`
          @import "../index.scss";

          .dashboard-control {
            margin: 0 auto auto auto;
            width: 100vw;
            display: flex;
            height: 100%;
            flex-direction: column;

            h1,
            h2,
            h3,
            h4 {
              margin: 2px;
              font-weight: bold;
              letter-spacing: 1px;
            }

            .dashboard-overview {
              text-align: center;

              .dashboard-header {
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

            .dashboard-table {
              flex: 1 1 0%;
              overflow-y: scroll;

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
                position: sticky;
                z-index: 1;
                top: 0;

                &:hover {
                  cursor: pointer;
                  background-color: white;
                }
              }

              tr {
                height: 44px;
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
                position: sticky;

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
                }
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
    </Container>
  );
}
