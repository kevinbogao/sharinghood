import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useCreateUserMutation } from "../hooks/api/UsersHooks";
import { useForm } from "../hooks/useForm";
import { useCommunityInputStore } from "../lib/client/Store";
import { createUserBodySchema } from "../lib/schema/users";

const Register: NextPage = () => {
  const router = useRouter();
  const { community_id: communityId } = router.query;
  const communityInput = useCommunityInputStore((store) => store.communityInput);
  const { register, handleSubmit, errors } = useForm(createUserBodySchema);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!communityId && !communityInput) {
      void router.replace("/communities/create");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityInput, communityId]);

  const { mutate, isLoading } = useCreateUserMutation({
    onSuccess: async () => router.push("/login"),
  });

  return (
    <div className="flex h-full">
      <div className="m-auto w-64">
        <form
          onSubmit={handleSubmit((form) =>
            mutate({ ...form, community_input: communityInput, community_id: communityId as string })
          )}
        >
          {communityInput?.name ? <p className="mb-5 text-base">Register to join {communityInput.name}</p> : null}
          <Input className="mb-2" errText={errors.name} placeholder="User name" {...register("name")} />
          <Input className="mb-2" errText={errors.email} placeholder="E-mail" {...register("email")} />
          <Input
            className="mb-2"
            errText={errors.password}
            placeholder="password"
            type="password"
            {...register("password")}
          />
          <Button isLoading={isLoading} type="submit">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
