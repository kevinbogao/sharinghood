import { useCallback } from "react";

import { useCommunityIdStore } from "../lib/client/Store";
import type { TGetUsersResponse } from "../pages/api/users";
import { useUsersQuery } from "./api/UsersHooks";

interface IUseCommunityMemberResult {
  getMember: (userId: string) => TGetUsersResponse["users"][number] | undefined;
  isLoading: boolean;
}

export const useCommunityMember = (): IUseCommunityMemberResult => {
  const communityId = useCommunityIdStore((store) => store.communityId);
  const { data, isLoading } = useUsersQuery(communityId as string, {
    enabled: Boolean(communityId),
  });

  const getMember = useCallback((userId: string) => data?.users.find(({ id }) => id === userId), [data?.users]);

  return {
    getMember,
    isLoading,
  };
};
