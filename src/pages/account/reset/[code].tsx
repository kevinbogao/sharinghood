import type { NextPage } from "next";
import { useRouter } from "next/router";

import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useResetPasswordCodeQuery, useSetPasswordMutation } from "../../../hooks/api/AuthHooks";
import { useForm } from "../../../hooks/useForm";
import { useRouterQuery } from "../../../hooks/useRouterQuery";
import { ToastTypeEnum } from "../../../lib/client/enums";
import { useToastStore } from "../../../lib/client/Store";
import { resetPasswordCodeQuerySchema, setPasswordBodySchema } from "../../../lib/schema/auth";

const ResetPassword: NextPage = () => {
  const router = useRouter();
  const { query } = useRouterQuery(resetPasswordCodeQuerySchema);
  const addToast = useToastStore((state) => state.addToast);
  const { register, handleSubmit, errors } = useForm(setPasswordBodySchema.pick({ password: true }));

  const { isSuccess } = useResetPasswordCodeQuery(query?.code as string, { enabled: Boolean(query?.code) });

  const { mutate, isLoading } = useSetPasswordMutation({
    onSuccess: async () => {
      addToast({ type: ToastTypeEnum.SUCCESS, message: "Your password has been successfully reset!" });
      await router.replace("/login");
    },
  });

  if (!isSuccess) {
    return (
      <div className="flex h-full">
        <p className="m-auto text-sm">This link is not longer valid</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <form
        className="m-auto w-64"
        onSubmit={handleSubmit(({ password }) => mutate({ code: query?.code as string, password }))}
      >
        <p className="mb-4 text-sm">Please enter a new password</p>
        <Input
          className="mb-2"
          errText={errors.password}
          placeholder="password"
          {...register("password")}
          type="password"
        />
        <Button isLoading={isLoading} type="submit">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
