import type { NextPage } from "next";
import { useRouter } from "next/router";

import { useCreateNotificationMutation } from "../../hooks/api/NotificationsHooks";
import { useCommunityMember } from "../../hooks/useCommunityMember";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { useCommunityIdStore } from "../../lib/client/Store";
import { baseQuerySchema } from "../../lib/schema";

const Member: NextPage = () => {
  const router = useRouter();
  const { query } = useRouterQuery(baseQuerySchema);
  const communityId = useCommunityIdStore((store) => store.communityId);

  const { getMember } = useCommunityMember();

  const { mutate } = useCreateNotificationMutation({
    onSuccess: async ({ notification }) => router.push(`/notifications/${notification.id}`),
  });

  const member = getMember(query?.id as string);

  return (
    <div>
      <p>{member?.name}</p>
      <button
        onClick={() => mutate({ community_id: communityId as string, recipient_id: member?.id as string })}
        type="button"
      >
        Message
      </button>
    </div>
  );
};

export default Member;
