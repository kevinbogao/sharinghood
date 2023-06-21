import type { NextPage } from "next";

import { Switch } from "../../components/Switch";
import { ItemsGridTemplate } from "../../components/templates/ItemsGridTemplate";
import { useRequestsQuery } from "../../hooks/api/RequestHooks";
import { useCommunityIdStore } from "../../lib/client/Store";
import type { TRequest } from "../../lib/schema/requests";

const Requests: NextPage = () => {
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));
  const { data, fetchNextPage, hasNextPage, isLoading } = useRequestsQuery(communityId ?? "", {
    enabled: Boolean(communityId),
  });

  const items = data?.pages.reduce<Array<TRequest>>((requests, page) => requests.concat(page.requests), []);

  return (
    <>
      <Switch />
      <ItemsGridTemplate
        emptyDescription="There are no requests available"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        items={items}
        redirectLable="Request now"
        redirectLink="/requests/create"
      />
    </>
  );
};

export default Requests;
