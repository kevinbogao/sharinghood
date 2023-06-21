import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useSearchCommunityMutation } from "../hooks/api/CommunityHooks";
import { useForm } from "../hooks/useForm";
import { ColorTypeEnum } from "../lib/client/enums";
import { ResponseErrorCodeEnum } from "../lib/http/enums";
import { searchCommunityQuerySchema } from "../lib/schema/communities";
import { isObject } from "../lib/utils/object";

const Index: NextPage = () => {
  const router = useRouter();
  const { register, handleSubmit, setError, errors } = useForm(searchCommunityQuerySchema);

  const { mutate, isLoading } = useSearchCommunityMutation({
    onError: (err) => {
      const notFoundErr = err.errors.find((e) => e.code === ResponseErrorCodeEnum.NOT_FOUND_ERROR);
      if (notFoundErr) {
        setError("code", "Community not found");
      }
    },
    onSuccess: async (data) => {
      if (!isObject(data.community)) {
        return;
      }
      await router.push({
        pathname: "/register",
        query: { community_id: data.community.id },
      });
    },
  });

  return (
    <div className="flex h-full">
      <div className="m-auto w-64">
        <form onSubmit={handleSubmit((form) => mutate(form))}>
          <p className="mb-3 font-medium">Find an existing community</p>
          <Input errText={errors.code} placeholder="Community code" {...register("code")} />
          <Button isLoading={isLoading} type="submit">
            Find community
          </Button>
        </form>
        <p className="mt-6 mb-2 font-medium">Create your community</p>
        <Button colorType={ColorTypeEnum.SECONDARY} type="button">
          <Link href="/communities/create">Create community</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
