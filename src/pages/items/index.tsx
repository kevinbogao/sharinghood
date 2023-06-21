import type { NextPage } from "next";

import { Switch } from "../../components/Switch";
import { ItemsGridTemplate } from "../../components/templates/ItemsGridTemplate";
import { usePostsQuery } from "../../hooks/api/PostHooks";
import { useCommunityIdStore } from "../../lib/client/Store";
import type { TPost } from "../../lib/schema/posts";

const Items: NextPage = () => {
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));
  const { data, fetchNextPage, hasNextPage, isLoading } = usePostsQuery(communityId as string, {
    enabled: Boolean(communityId),
  });

  const items = data?.pages.reduce<Array<TPost>>((posts, page) => posts.concat(page.posts), []);

  return (
    <>
      <Switch />
      <ItemsGridTemplate
        emptyDescription="There are no items available"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        items={items}
        redirectLable="Share now"
        redirectLink="/items/share"
      />
    </>
  );
};

export default Items;
