import type { FC } from "react";

import { useCommunitiesQuery } from "../../hooks/api/CommunityHooks";
import { useAddPostToCommunityMutation, usePostCommunitiesQuery } from "../../hooks/api/PostHooks";
import { ToastTypeEnum } from "../../lib/client/enums";
import { useToastStore } from "../../lib/client/Store";
import { Button } from "../Button";
import { Modal } from ".";

interface IItemCommunitiesModal {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  postId?: string;
  postName?: string;
}

export const ItemCommunitiesModal: FC<IItemCommunitiesModal> = ({ isModalOpen, setIsModalOpen, postId, postName }) => {
  const addToast = useToastStore((state) => state.addToast);

  const { data: postCommunitiesData } = usePostCommunitiesQuery(postId as string, { enabled: Boolean(postId) });
  const { data: communitiesData } = useCommunitiesQuery();

  const { mutate, isLoading } = useAddPostToCommunityMutation(postId as string, {
    onSuccess: ({ community }) => {
      addToast({ type: ToastTypeEnum.SUCCESS, message: `Successfully add ${postName} to ${community.name}` });
    },
  });

  const communities = communitiesData?.communities.filter(
    ({ id }) => !postCommunitiesData?.communities.find((community) => community.id === id)
  );

  return (
    <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
      <div className="mx-3 my-1 w-64">
        {communities?.length === 0 ? (
          <p className="mb-2 text-sm">You have shared {postName} in all your communities</p>
        ) : (
          <p className="mb-2 text-sm">Add item to community</p>
        )}
        {communities?.map(({ id, name }) => (
          <div key={id}>
            <Button isLoading={isLoading} onClick={() => mutate({ community_id: id })} type="button">
              {name}
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};
