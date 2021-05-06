import { Route, Redirect } from "react-router-dom";
import { useReactiveVar } from "@apollo/client";
import SelectCommunity from "../views/Community/SelectCommunity";
import { accessTokenVar, selCommunityIdVar } from "../utils/cache";

export default function ProtectedRoute({ component: Component, ...rest }: any) {
  const accessToken = useReactiveVar(accessTokenVar);
  const selCommunityId = useReactiveVar(selCommunityIdVar);

  return (
    <Route
      {...rest}
      render={(props) =>
        accessToken ? (
          <>
            {selCommunityId ? (
              <Component {...props} communityId={selCommunityId} />
            ) : (
              // @ts-ignore
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
  );
}
