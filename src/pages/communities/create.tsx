import type { NextPage } from "next";
import { useRouter } from "next/router";

import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useSessionQuery } from "../../hooks/api/AuthHooks";
import { useCreateCommunityMutation, useSearchCommunityMutation } from "../../hooks/api/CommunityHooks";
import { useForm } from "../../hooks/useForm";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import { useCommunityIdStore, useCommunityInputStore } from "../../lib/client/Store";
import { ResponseErrorCodeEnum } from "../../lib/http/enums";
import { createCommunityBodySchema } from "../../lib/schema/communities";

const CreateCommunity: NextPage = () => {
  const router = useRouter();
  const { setCommunityId } = useCommunityIdStore((store) => ({ setCommunityId: store.setCommunityId }));
  const { communityInput, setCommunityInput } = useCommunityInputStore((store) => ({
    communityInput: store.communityInput,
    setCommunityInput: store.setCommunityInput,
  }));
  const { register, handleSubmit, setError, errors } = useForm(createCommunityBodySchema);

  const { data } = useSessionQuery();
  const { mutate: createCommunityMutate, isLoading: isCreateCommunityLoading } = useCreateCommunityMutation({
    onSuccess: async ({ community }) => {
      setCommunityId(community.id);
      await queryClient.invalidateQueries(QueryKeys.Communities.communities);
      await router.push("/items");
    },
  });
  const { mutate: searchCommunityMutate, isLoading: isSearchCommunityLoading } = useSearchCommunityMutation({
    onError: (err) => {
      if (err.errors[0]?.code === ResponseErrorCodeEnum.NOT_FOUND_ERROR) {
        if (!data?.user) {
          void router.push("/register");
        }

        if (communityInput) {
          createCommunityMutate({
            code: communityInput.code,
            name: communityInput.name,
            zip_code: communityInput.zipCode,
          });
        }
      }
    },
    onSuccess: () => {
      setError("code", "Community code exists");
      setCommunityInput();
    },
  });

  return (
    <div className="flex h-full">
      <form
        className="m-auto w-64"
        onSubmit={handleSubmit(({ name, code, zip_code }) => {
          setCommunityInput({ code, name, zipCode: zip_code });
          searchCommunityMutate({ code });
        })}
      >
        <p className="mb-5">Create a community now and invite your members via link later</p>
        <Input className="mb-2" errText={errors.name} placeholder="Community name" {...register("name")} />
        <Input className="mb-2" errText={errors.code} placeholder="Community code" {...register("code")} />
        <Input className="mb-2" errText={errors.zip_code} placeholder="Zip code" {...register("zip_code")} />
        <Button isLoading={isSearchCommunityLoading || isCreateCommunityLoading} type="submit">
          Next
        </Button>
      </form>
    </div>
  );
};

export default CreateCommunity;
