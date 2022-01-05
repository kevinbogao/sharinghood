import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { queries } from "../../lib/gql";
import { Container } from "../../components/Container";
import type { UnsubscribeUserData, UnsubscribeUserVars } from "../../lib/types";

export default function Unsubscribe() {
  const router = useRouter();
  const { id, to } = router.query;
  const { loading, error, data } = useQuery<
    UnsubscribeUserData,
    UnsubscribeUserVars
  >(queries.UNSUBSCRIBE_USER, {
    skip: !id || !to,
    variables: { userId: id?.toString()!, token: to?.toString()! },
  });

  return (
    <Container auth={false} loading={loading} error={error}>
      <div className="unsubscribe-control">
        {data?.unsubscribeUser ? (
          <>
            <h1>Sorry to see you go!</h1>
            <h3>
              You&apos;ve been successfully unsubscribed from Sharinghood.
            </h3>
          </>
        ) : (
          <h3 className="main-p">This link is no longer valid.</h3>
        )}
        <style jsx>
          {`
            @import "../index.scss";

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
    </Container>
  );
}
