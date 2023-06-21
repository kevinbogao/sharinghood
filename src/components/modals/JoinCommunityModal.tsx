import { useRouter } from "next/router";
import type { FC } from "react";

import { useJoinCommunityMutation } from "../../hooks/api/CommunityHooks";
import { ColorTypeEnum } from "../../lib/client/enums";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import { useCommunityIdStore } from "../../lib/client/Store";
import type { TSearchCommunityResponse } from "../../pages/api/communities/search";
import { Button } from "../Button";
import { Modal } from ".";

interface IJoinCommunityModal {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  community: TSearchCommunityResponse["community"];
}

export const JoinCommunityModal: FC<IJoinCommunityModal> = ({ isModalOpen, setIsModalOpen, community }) => {
  const router = useRouter();
  const { setCommunityId } = useCommunityIdStore((store) => ({ setCommunityId: store.setCommunityId }));
  const { mutate, isLoading } = useJoinCommunityMutation(community.id, {
    onSuccess: async () => {
      setCommunityId(community.id);
      await queryClient.invalidateQueries(QueryKeys.Communities.communities);
      await router.push("/items");
    },
  });

  return (
    <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
      <div className="mx-4 my-2 w-64">
        <p className="mb-2 mt-4 text-sm">Join {community.name}</p>
        <Button isLoading={isLoading} onClick={() => mutate()} type="button">
          Yes
        </Button>
        <Button colorType={ColorTypeEnum.SECONDARY} onClick={() => setIsModalOpen(false)} type="button">
          No
        </Button>
      </div>
    </Modal>
  );
};
