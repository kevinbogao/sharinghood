import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

const GET_TOKEN = gql`
  {
    token @client
  }
`;

function ProtectedRoute({ component: Component, ...rest }) {
  const {
    data: { token },
  } = useQuery(GET_TOKEN);

  return (
    <Route
      {...rest}
      render={(props) =>
        !!token ? (
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
