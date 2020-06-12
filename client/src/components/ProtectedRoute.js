import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

const GET_ACCESS_TOKEN = gql`
  {
    accessToken @client
  }
`;

function ProtectedRoute({ component: Component, ...rest }) {
  const {
    data: { accessToken },
  } = useQuery(GET_ACCESS_TOKEN);

  return (
    <Route
      {...rest}
      render={(props) =>
        !!accessToken ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

export default ProtectedRoute;
