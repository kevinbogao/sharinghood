/* eslint-disable */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

const GET_ACCESS_TOKEN = gql`
  {
    accessToken @client
  }
`;

function ProtectedRoute({ component: Component, ...rest }) {
  const { data } = useQuery(GET_ACCESS_TOKEN);

  return (
    data && (
      <Route
        {...rest}
        render={(props) =>
          data?.accessToken ? (
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
    )
  );
}

export default ProtectedRoute;
