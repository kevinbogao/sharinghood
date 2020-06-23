import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Loading from '../components/Loading';

const GET_TOKEN_PAYLOAD = gql`
  {
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
const ID_SET = new Set(ID_KEYS);
const DATE_KEYS = ['createdAt', 'dateNeed', 'dateReturn'];
const DATE_SET = new Set(DATE_KEYS);

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
    onCompleted: (data) => {
      console.log(data);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  function sortColumns(column) {
    // TODO: implement sorting
    setSelectedCol(column);
  }

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : !tokenPayload.isAdmin ? (
    <Redirect to={from} />
  ) : (
    <div className="dashboard-control">
      <div className="cad-overview">
        <div className="cad-overview-highlight">
          <h2>{data.communityActivities.name} Community</h2>
          <h4>
            ID: {data.communityActivities._id} | Code:{' '}
            {data.communityActivities.code} | Zipcode:{' '}
            {data.communityActivities.zipCode}
          </h4>
        </div>
        <div className="cad-overview-stats">
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
              <h4>Total {stat}</h4>
            </div>
          ))}
        </div>
        <table>
          <tbody>
            <tr className="cad-table-header">
              {Object.keys(
                data.communityActivities[selectedStat].length &&
                  data.communityActivities[selectedStat][0],
              )
                .filter((key) => key !== '__typename')
                .map((key) => (
                  <th key={key} onClick={() => sortColumns(key)}>
                    {key}{' '}
                    {selectedCol === key && (
                      <FontAwesomeIcon
                        className="cad-sort-icons"
                        icon={faArrowDown}
                        size="1x"
                      />
                    )}
                  </th>
                ))}
            </tr>
            {data.communityActivities[selectedStat].map((stat) => (
              <tr key={stat._id} className="cad-table-row">
                {Object.keys(stat)
                  .filter((key) => key !== '__typename')
                  .map((key) => (
                    <td key={key}>
                      {key === 'image' ? (
                        <img src={JSON.parse(stat[key]).secure_url} alt="" />
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

            .cad-overview {
              width: 100%;
              text-align: center;
              margin: 0 auto;
              border-bottom-style: solid;
              border-bottom-width: 1px;
              background-color: $green-200;
              color: $white;

              .cad-overview-highlight {
                padding: 10px 0px;

                h4 {
                  letter-spacing: 1px;
                }
              }

              .cad-overview-stats {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
                align-items: center;

                .stat-clickable {
                  width: 25%;
                  cursor: pointer;
                  background-color: $white;
                  color: $green-200;
                  padding: 5px 0px;
                }

                .stat-active {
                  background-color: $green-200;
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

            .cad-table-header {
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

              .cad-sort-icons {
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
