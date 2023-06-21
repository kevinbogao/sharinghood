import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { JoinCommunityModal } from "../../components/modals/JoinCommunityModal";
import { useCommunitiesQuery, useSearchCommunityMutation } from "../../hooks/api/CommunityHooks";
import { useForm } from "../../hooks/useForm";
import { ColorTypeEnum } from "../../lib/client/enums";
import { useCommunityIdStore } from "../../lib/client/Store";
import { ResponseErrorCodeEnum } from "../../lib/http/enums";
import { searchCommunityQuerySchema } from "../../lib/schema/communities";
import type { TSearchCommunityResponse } from "../api/communities/search";

const Communities: NextPage = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [communityData, setCommunityData] = useState<TSearchCommunityResponse["community"]>();

  const { communityId, setCommunityId } = useCommunityIdStore((store) => ({
    communityId: store.communityId,
    setCommunityId: store.setCommunityId,
  }));
  const { register, handleSubmit, setError, errors } = useForm(searchCommunityQuerySchema);

  const { data: communitiesData } = useCommunitiesQuery();
  const { mutate, isLoading } = useSearchCommunityMutation({
    onError: (err) => {
      const notFoundErr = err.errors.find(({ code }) => code === ResponseErrorCodeEnum.NOT_FOUND_ERROR);
      if (notFoundErr) {
        setError("code", "Community not found");
      }
    },
    onSuccess: (data) => {
      if (communitiesData?.communities.find(({ id }) => id === data.community.id)) {
        setError("code", "You're a member already");
      }

      setCommunityData(data.community);
      setIsModalOpen(true);
    },
  });

  useEffect(() => {
    if (communityId) {
      void router.replace("/items");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const onCommunityClick = (id: string): void => {
    setCommunityId(id);
    void router.replace("/items");
  };

  return (
    <div className="flex h-full">
      <div className="m-auto w-64">
        {communitiesData?.communities.map(({ id, name, notification_count }) => (
          <Button key={id} onClick={() => onCommunityClick(id)} type="button">
            <div className="flex items-center justify-center">
              <p>{name}</p>
              {notification_count > 0 && <div className="ml-5 aspect-square w-2.5 rounded-full bg-red-500" />}
            </div>
          </Button>
        ))}
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <p className="mb-3 mt-6 font-medium">Join an other community</p>
          <Input errText={errors.code} placeholder="Community code" {...register("code")} />
          <Button isLoading={isLoading} type="submit">
            Find community
          </Button>
        </form>
        <p className="mt-3 mb-2 font-medium">Or Create a new community</p>
        <Button colorType={ColorTypeEnum.SECONDARY} type="button">
          <Link href="/communities/create">Create community</Link>
        </Button>
        {communityData ? (
          <JoinCommunityModal community={communityData} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        ) : null}
      </div>
    </div>
  );
};

export default Communities;
