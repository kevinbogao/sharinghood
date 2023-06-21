import type { NextPage } from "next";

import { useUnsubscribeUserQuerySchema } from "../../hooks/api/UsersHooks";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { unsubscribeUserQuerySchema } from "../../lib/schema/users";

const Unsubscribe: NextPage = () => {
  const { query } = useRouterQuery(unsubscribeUserQuerySchema);
  const { error, isLoading } = useUnsubscribeUserQuerySchema(query?.id as string, query?.token as string, {
    enabled: Boolean(query?.id) && Boolean(query?.token),
  });

  if (isLoading) {
    return null;
  }

  return (
    <div className="m-auto text-center">
      {error ? (
        <p className="mb-4 text-lg font-medium">This link is no longer valid.</p>
      ) : (
        <>
          <p className="mb-4 text-lg font-medium">Sorry to see you go!</p>
          <p>You&apos;ve been successfully unsubscribed from Sharinghood.</p>
        </>
      )}
    </div>
  );
};

export default Unsubscribe;
