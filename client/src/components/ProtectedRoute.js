/* eslint-disable */
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import SelectCommunity from "../views/Community/SelectCommunity";

const GET_ACCESS_TOKEN = gql`
  query {
    accessToken @client
    selCommunityId @client
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
            <>
              {data?.selCommunityId ? (
                <Component {...props} communityId={data?.selCommunityId} />
              ) : (
                <SelectCommunity {...props} />
              )}
            </>
          ) : (
            <Redirect
              to={{
                pathname: "/login",
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
