import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import { Button } from "../../components/Button";
import { useCommunitiesQuery, useSearchCommunityQuery } from "../../hooks/api/CommunityHooks";
import { useRouterQuery } from "../../hooks/useRouterQuery";
import { apiRequestSSR } from "../../lib/client/apiRequest";
import { useCommunityIdStore, useCommunityInputStore } from "../../lib/client/Store";
import { searchCommunityQuerySchema } from "../../lib/schema/communities";
import type { TSearchCommunityResponse } from "../api/communities/search";

interface ICommunityResponse {
  community: TSearchCommunityResponse | null;
}

export const getServerSideProps: GetServerSideProps<ICommunityResponse> = async ({ req, params }) => {
  const community = await apiRequestSSR<TSearchCommunityResponse>(req, `/communities/search?code=${params?.code}`);
  return { props: { community } };
};

export const FindCommunity: NextPage<ICommunityResponse> = ({ community }) => {
  const router = useRouter();
  const { query } = useRouterQuery(searchCommunityQuerySchema);

  const setCommunityId = useCommunityIdStore((store) => store.setCommunityId);
  const setCommunityInput = useCommunityInputStore((store) => store.setCommunityInput);

  useCommunitiesQuery({
    onSuccess: async ({ communities }) => {
      const _community = communities.find(({ code }) => code === query?.code);
      if (_community) {
        setCommunityId(_community.id);
        await router.push("/items");
      }
    },
  });
  const { data } = useSearchCommunityQuery(query?.code as string, {
    enabled: Boolean(query?.code),
    ...(community && { initialData: community }),
  });

  const onClick = async (): Promise<void> => {
    if (!data?.community) {
      return;
    }

    setCommunityInput({ code: data.community.code, name: data.community.name, zipCode: data.community.code });
    await router.push("/register");
  };

  if (!data?.community) {
    return (
      <div className="m-auto text-center">
        <p className="text-sm">Community not found</p>
      </div>
    );
  }

  return (
    <div className="m-auto text-center">
      <p className="mb-5 text-lg font-semibold">Amazing to see you here!</p>
      <p className="mb-2 text-sm">You have been invited to {data.community.name}</p>
      <p className="mb-2 text-sm">Sharinghood is a platform which enables you to share items with your community.</p>
      <p className="mb-2 text-sm">You are only one registration away from an easier life.</p>
      <Button className="mx-auto mt-6 w-64" onClick={onClick} type="button">
        Join {data.community.name}
      </Button>
    </div>
  );
};

export default FindCommunity;
