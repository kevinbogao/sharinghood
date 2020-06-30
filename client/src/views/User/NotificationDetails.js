import React from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_NOTIFICATION = gql`
  query GetNotification($notificationId: ID!) {
    notification(notificationId: $notificationId) {
      _id
      booking {
        _id
        post {
          _id
          title
          image
        }
      }
      participants {
        _id
        name
        image
      }
      messages {
        _id
      }
    }
  }
`;

function NotificationDetails({ match }) {
  const { loading, error, data } = useQuery(GET_NOTIFICATION, {
    variables: { notificationId: match.params.id },
    onCompleted: (data) => {
      console.log(data);
    },
    onError: ({ message }) => {
      console.log(message);
    },
  });

  return (
    <div>
      <p>Notification Details</p>
    </div>
  );
}

export default NotificationDetails;
