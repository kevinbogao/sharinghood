import type { NextPage } from "next";

import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useResetPasswordMutation } from "../../hooks/api/AuthHooks";
import { useForm } from "../../hooks/useForm";
import { ResponseErrorCodeEnum } from "../../lib/http/enums";
import { resetPasswordBodySchema } from "../../lib/schema/auth";

const ForgotPassword: NextPage = () => {
  const { register, handleSubmit, setError, errors } = useForm(resetPasswordBodySchema);

  const { mutate, isLoading, isSuccess } = useResetPasswordMutation({
    onError: (err) => {
      const notFoundErr = err.errors.find((e) => e.code === ResponseErrorCodeEnum.NOT_FOUND_ERROR);
      if (notFoundErr) {
        setError("email", "Invalid E-mail");
      }
    },
  });

  if (isSuccess) {
    return (
      <div className="flex h-full">
        <p className="m-auto text-sm">
          Reset password instructions have been sent, Please check your email to recover your account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <form className="m-auto w-64" onSubmit={handleSubmit((data) => mutate(data))}>
        <p className="mb-4 text-sm">You will receive the instructions to reset your password</p>
        <Input className="mb-2" errText={errors.email} placeholder="E-mail" {...register("email")} />
        <Button isLoading={isLoading} type="submit">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
