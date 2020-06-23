import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import Loading from '../components/Loading';

const GET_TOKEN_PAYLOAD = gql`
  {
    tokenPayload @client
  }
`;

const GET_ACTIVITIES = gql`
  query {
    totalActivities {
      totalCommunities
      totalUsers
      totalPosts
      totalRequests
      totalBookings
      communitiesActivities {
        _id
        name
        numUsers
        numPosts
        numRequests
        numBookings
      }
    }
  }
`;

function Dashboard({ location, history }) {
  const { from } = location.state || { from: { pathname: '/' } };
  const {
    data: { tokenPayload },
  } = useQuery(GET_TOKEN_PAYLOAD);
  const { loading, error, data } = useQuery(GET_ACTIVITIES, {
    skip: !tokenPayload.isAdmin,
    // onCompleted: (data) => {
    //   console.log(data);
    // },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : !tokenPayload.isAdmin ? (
    <Redirect to={from} />
  ) : (
    <div className="dashboard-control">
      <div className="cad-overview">
        <div className="cad-overview-highlight">
          <h1>{data.totalActivities.totalCommunities}</h1>
          <h3>Total Communities</h3>
        </div>
        <div className="cad-overview-stats">
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
      <table>
        <thead>
          <tr className="cad-table-header">
            <th>Community ID</th>
            <th>Community Name</th>
            <th>Users</th>
            <th>Posts</th>
            <th>Requests</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          {data.totalActivities.communitiesActivities.map(
            (communityActivities) => (
              <tr
                key={communityActivities._id}
                className="cad-table-row"
                onClick={() => {
                  history.push(`/dashboard/${communityActivities._id}`);
                }}
              >
                <td>{communityActivities._id}</td>
                <td>{communityActivities.name}</td>
                <td>{communityActivities.numUsers}</td>
                <td>{communityActivities.numPosts}</td>
                <td>{communityActivities.numRequests}</td>
                <td>{communityActivities.numBookings}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
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
        pathname: '/',
      }),
    }),
  }),
};

export default Dashboard;
