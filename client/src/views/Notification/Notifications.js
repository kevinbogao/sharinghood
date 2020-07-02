import React from 'react';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';
import Loading from '../../components/Loading';
import NotificationItem from '../../components/NotificationItem';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      _id
      onType
      booking {
        _id
        status
        dateType
        dateNeed
        dateReturn
        post {
          _id
          title
          image
        }
        booker {
          _id
        }
      }
      participants {
        _id
        name
        image
      }
      isRead
    }
    tokenPayload @client
  }
`;

function Notifications({ history }) {
  const { loading, error, data } = useQuery(GET_NOTIFICATIONS, {
    onCompleted: ({ notifications, tokenPayload }) => {
      console.log(notifications);
      // // console.log(tokenPayload.userId);
      // for (let i = 0; i < notifications.length; i++) {
      //   console.log(notifications[i]);
      //   console.log(notifications[i].isRead[tokenPayload.userId]);
      // }
      // console.log(notifications);
      // console.log(tokenPayload);
    },
  });

  return loading ? (
    <Loading />
  ) : error ? (
    `Error ${error.message}`
  ) : (
    <div className="notifications-control">
      <NotificationItem
        notifications={data.notifications}
        tokenPayload={data.tokenPayload}
        history={history}
      />
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .notifications-control {
            margin: 30px auto;

            @include sm {
              margin: 15px auto 30px auto;
            }
          }
        `}
      </style>
    </div>
  );
}

Notifications.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Notifications;
