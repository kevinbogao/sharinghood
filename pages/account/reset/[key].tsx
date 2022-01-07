import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { queries, mutations } from "../../../lib/gql";
import { Container, InlineError, Loader } from "../../../components/Container";
import type {
  ResetPasswordData,
  ResetPasswordVars,
  ValidateResetLinkData,
  ValidateResetLinkVars,
} from "../../../lib/types";

interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>();
  const [success, setSuccess] = useState(false);
  const { loading, error, data } = useQuery<
    ValidateResetLinkData,
    ValidateResetLinkVars
  >(queries.VALIDATE_RESET_LINK, {
    skip: !router.query.key,
    variables: { resetKey: router.query.key?.toString()! },
  });

  const [resetPassword, { loading: mutationLoading }] = useMutation<
    ResetPasswordData,
    ResetPasswordVars
  >(mutations.RESET_PASSWORD, {
    onCompleted({ resetPassword }) {
      if (resetPassword) setSuccess(true);
    },
    onError() {
      setSuccess(false);
    },
  });

  return (
    <Container auth={false} loading={loading} error={error}>
      <div className="reset-password-control">
        {data?.validateResetLink ? (
          <>
            {success ? (
              <>
                <p className="main-p">
                  Your password has been successfully reset!
                </p>

                <button
                  className="main-btn"
                  type="button"
                  onClick={() => router.push("/login")}
                >
                  Back to login
                </button>
              </>
            ) : (
              <>
                <p className="main-p">
                  Reset password instructions have been sent.
                </p>
                <p className="main-p">
                  Please check your email to recover your account.
                </p>
                <form
                  onSubmit={handleSubmit((form) => {
                    if (Object.keys(errors).length === 0) {
                      resetPassword({
                        variables: {
                          resetKey: router.query.key?.toString()!,
                          password: form.password,
                        },
                      });
                    }
                  })}
                >
                  <input
                    type="password"
                    className="main-input"
                    placeholder="Password"
                    {...register("password", {
                      required: "Please enter your password",
                      minLength: {
                        value: 7,
                        message:
                          "Your password must be longer than 7 characters",
                      },
                    })}
                  />
                  {errors.password && (
                    <InlineError text={errors.password.message!} />
                  )}
                  <input
                    type="password"
                    className="main-input"
                    placeholder="Confirm Password"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                  />
                  {errors.confirmPassword && (
                    <InlineError text={errors.confirmPassword.message!} />
                  )}
                  <button className="main-btn block" type="submit">
                    {mutationLoading ? <Loader /> : "Confirm"}
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
          <>
            <p className="main-p">Your link is not longer valid.</p>
            <button
              className="main-btn block"
              type="submit"
              onClick={() => router.push("/account/reset")}
            >
              Try again
            </button>
          </>
        )}
        <style jsx>
          {`
            @import "../../index.scss";

            .reset-password-control {
              margin: auto;

              @include sm {
                max-width: 300px;
                width: 80vw;
              }
            }
          `}
        </style>
      </div>
    </Container>
  );
}
