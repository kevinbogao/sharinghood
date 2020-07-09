import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Loading from '../components/Loading';

const GET_TOKEN_PAYLOAD = gql`
  query {
    tokenPayload @client
  }
`;

const GET_COMMUNITY_ACTIVITIES = gql`
  query CommunityActivities($communityId: ID!) {
    communityActivities(communityId: $communityId) {
      _id
      name
      code
      zipCode
      creator {
        _id
      }
      members {
        _id
        name
        email
        image
        isNotified
        createdAt
      }
      posts {
        _id
        title
        desc
        condition
        image
        isGiveaway
        creator {
          _id
        }
        createdAt
      }
      requests {
        _id
        title
        desc
        dateNeed
        dateReturn
        image
        creator {
          _id
        }
        createdAt
      }
      bookings {
        _id
        post {
          _id
        }
        status
        dateNeed
        dateReturn
        booker {
          _id
        }
      }
    }
  }
`;

const STATS_IDS = ['members', 'posts', 'requests', 'bookings'];
const ID_KEYS = ['post', 'creator', 'booker'];
const DATE_KEYS = ['createdAt', 'dateNeed', 'dateReturn'];
const USER_KEYS = ['creator', 'booker'];
const ID_SET = new Set(ID_KEYS);
const DATE_SET = new Set(DATE_KEYS);
const USER_SET = new Set(USER_KEYS);
const FORMATED_KEYS = {
  _id: 'ID',
  post: 'Post ID',
  name: 'Name',
  email: 'Email',
  title: 'Title',
  status: 'Status',
  booker: 'Booker ID',
  image: 'Picture',
  creator: 'Creator ID',
  desc: 'Description',
  condition: 'Condition',
  isGiveaway: 'Giveaway',
  isNotified: 'Notified',
  dateNeed: 'Date Needed',
  dateReturn: 'Return Date',
  createdAt: 'Date Created',
};

function DashboardDetails({ location, match }) {
  const { from } = location.state || { from: { pathname: '/' } };
  const [selectedStat, setSelectedStat] = useState('members');
  const [selectedCol, setSelectedCol] = useState('_id');
  const {
    data: { tokenPayload },
  } = useQuery(GET_TOKEN_PAYLOAD);
  const { loading, error, data } = useQuery(GET_COMMUNITY_ACTIVITIES, {
    skip: !tokenPayload.isAdmin,
    variables: { communityId: match.params.id },
    // onCompleted: (data) => {
    //   console.log(data);
    // },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  function sortColumns(column) {
    // TODO: implement sorting
    setSelectedCol(column);
  }

  function findById(stat, key) {
    if (USER_SET.has(key)) {
      setSelectedStat('members');
      const targetItem = data.communityActivities.members.filter(
        (x) => x._id === stat[key]._id,
      );
      console.log(targetItem);
    }
  }

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : !tokenPayload.isAdmin ? (
    <Redirect to={from} />
  ) : (
    <div className="dashboard-control">
      <div className="dashboard-overview">
        <div className="dashboard-overview-highlight">
          <h2>{data.communityActivities.name} Community</h2>
          <h4>
            ID: {data.communityActivities._id} | Code:{' '}
            {data.communityActivities.code} | Zipcode:{' '}
            {data.communityActivities.zipCode}
          </h4>
        </div>
        <div className="dashboard-overview-stats">
          {STATS_IDS.map((stat) => (
            <div
              key={stat}
              className={`stat-clickable ${
                selectedStat === stat && 'stat-active'
              }`}
              onClick={() => setSelectedStat(stat)}
              role="presentation"
            >
              <h2>{data.communityActivities[stat].length}</h2>
              <h4>Total {stat.charAt(0).toUpperCase() + stat.slice(1)}</h4>
            </div>
          ))}
        </div>
        <table>
          <tbody>
            <tr className="dashboard-table-header">
              {Object.keys(
                data.communityActivities[selectedStat].length &&
                  data.communityActivities[selectedStat][0],
              )
                .filter((key) => key !== '__typename')
                .map((key) => (
                  <th key={key} onClick={() => sortColumns(key)}>
                    {FORMATED_KEYS[key]}{' '}
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
              <tr key={stat._id} className="dashboard-table-row">
                {Object.keys(stat)
                  .filter((key) => key !== '__typename')
                  .map((key) => (
                    // eslint-disable-next-line
                    <td key={key} onClick={() => findById(stat, key)}>
                      {key === 'image' ? (
                        <div
                          className="item-img"
                          style={{
                            backgroundImage: `url(${
                              JSON.parse(stat[key]).secure_url
                            })`,
                          }}
                        />
                      ) : ID_SET.has(key) ? (
                        stat[key]._id
                      ) : DATE_SET.has(key) ? (
                        moment(+stat[key]).format('MMM DD HH:mm')
                      ) : (
                        stat[key].toString()
                      )}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .dashboard-control {
            display: block;
            position: relative;
            max-width: $xl-max-width;
            width: 90%;
            margin: 10px auto;
            box-shadow: 0px 0px 10px $grey-200;

            h1,
            h2,
            h3,
            h4 {
              margin: 2px;
              font-weight: bold;
            }

            .dashboard-overview {
              width: 100%;
              text-align: center;
              margin: 0 auto;
              border-bottom-style: solid;
              border-bottom-width: 1px;
              background-color: $orange;
              color: $white;

              .dashboard-overview-highlight {
                padding: 10px 0px;

                h4 {
                  letter-spacing: 1px;
                }
              }

              .dashboard-overview-stats {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
                align-items: center;

                .stat-clickable {
                  width: 25%;
                  cursor: pointer;
                  background-color: $grey-200;
                  color: $orange;
                  padding: 5px 0px;
                }

                .stat-active {
                  background-color: $orange;
                  color: $white;
                }
              }
            }

            table {
              width: 100%;
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

              .item-img {
                margin: 2px;
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
        pathname: '/',
      }),
    }),
  }),
};

export default DashboardDetails;
