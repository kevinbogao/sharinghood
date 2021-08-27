import { match } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Spinner from "../../components/Spinner";
import ServerError from "../../components/ServerError";
import { queries } from "../../utils/gql";
import { typeDefs } from "../../utils/typeDefs";

interface UnsubscribeProps {
  match: match<{ id: string; token: string }>;
}

export default function Unsubscribe({ match }: UnsubscribeProps) {
  const { loading, error, data } = useQuery<
    typeDefs.UnsubscribeUserData,
    typeDefs.UnsubscribeUserVars
  >(queries.UNSUBSCRIBE_USER, {
    variables: { userId: match.params.id, token: match.params.token },
  });

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <div className="unsubscribe-control">
      {data?.unsubscribeUser ? (
        <>
          <h1>Sorry to see you go!</h1>
          <h3>You've been successfully unsubscribed from Sharinghood.</h3>
        </>
      ) : (
        <h3 className="main-p">This link is no longer valid.</h3>
      )}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .unsubscribe-control {
            margin: auto;
            text-align: center;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            h1 {
              font-size: 40px;
              margin: 0 auto 40px auto;
              color: $beige;

              @include sm {
                font-size: 35px;
              }
            }
          }
        `}
      </style>
    </div>
  );
}
