import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useLoginMutation } from "../hooks/api/AuthHooks";
import { useForm } from "../hooks/useForm";
import { useCommunityIdStore } from "../lib/client/Store";
import { ResponseErrorCodeEnum } from "../lib/http/enums";
import { loginBodySchema } from "../lib/schema/auth";

const Login: NextPage = () => {
  const router = useRouter();
  const { register, handleSubmit, setError, errors } = useForm(loginBodySchema);
  const { communityId } = useCommunityIdStore((store) => ({ communityId: store.communityId }));

  const { mutate, isLoading } = useLoginMutation({
    onError: (err) => {
      const notFoundErr = err.errors.find((e) => e.code === ResponseErrorCodeEnum.NOT_FOUND_ERROR);
      if (notFoundErr) {
        setError("password", "Invalid credentials");
        return;
      }

      const credentialsError = err.errors.find((e) => e.code === ResponseErrorCodeEnum.INVALID_CREDENTIALS);
      if (credentialsError) {
        setError("password", credentialsError.message);
      }
    },
    onSuccess: async () => {
      if (communityId) {
        await router.replace("/items");
        return;
      }

      await router.replace("/communities");
    },
  });

  return (
    <div className="flex h-full">
      <form className="m-auto w-64" onSubmit={handleSubmit((form) => mutate(form))}>
        <Input className="mb-2" errText={errors.email} placeholder="E-mail" {...register("email")} />
        <Input errText={errors.password} placeholder="Password" type="password" {...register("password")} />
        <Link className="text-sm underline" href="/account/forgot-password">
          Forgot password
        </Link>
        <div className="mb-3 mt-4 flex justify-between">
          <p className="text-sm">Not a member yet?</p>
          <Link className="ml-2 text-sm underline" href="/">
            Register
          </Link>
        </div>
        <Button isLoading={isLoading} type="submit">
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
