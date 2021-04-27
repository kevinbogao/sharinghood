import { Route, Redirect } from "react-router-dom";
import { useQuery } from "@apollo/client";
import SelectCommunity from "../views/Community/SelectCommunity";
import { queries } from "../utils/gql";

export default function ProtectedRoute({ component: Component, ...rest }) {
  const { data } = useQuery(queries.LOCAL_SESSION_DATA);

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
