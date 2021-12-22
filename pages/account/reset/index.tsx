import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useMutation, useReactiveVar } from "@apollo/client";
import { types } from "../../../lib/types";
import { mutations } from "../../../lib/gql";
import { InlineError, Loader } from "../../../components/Container";
import { accessTokenVar } from "../../_app";

interface EmailInput {
  email: string;
}

export default function ForgotPassword() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmailInput>();
  const accessToken = useReactiveVar(accessTokenVar);
  const [isReSend, setIsReSend] = useState(false);
  const [success, setSuccess] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState<string>("");

  // useRouter
  useEffect(() => {
    if (accessToken) router.back();
    // eslint-disable-next-line
  }, [accessToken]);

  const [forgotPassword, { loading: mutationLoading }] = useMutation<
    types.ForgotPasswordData,
    types.ForgotPasswordVars
  >(mutations.FORGOT_PASSWORD, {
    onCompleted({ forgotPassword }) {
      if (forgotPassword) setSuccess(true);
    },
    onError({ message }) {
      setError("email", { message: message.split(": ")[1] });
    },
  });

  return (
    <div className="forgot-password-control">
      {success ? (
        <>
          <p className="main-p">Reset password instructions have been sent.</p>
          <p className="main-p">
            Please check your email to recover your account.
          </p>
          {!isReSend && (
            <button
              className="main-btn block"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (enteredEmail) {
                  forgotPassword({
                    variables: { email: enteredEmail },
                  });
                }
                setIsReSend(true);
                setTimeout(() => {
                  setIsReSend(false);
                }, 5000);
              }}
            >
              Resend
            </button>
          )}
        </>
      ) : (
        <>
          <p className="main-p">
            You will receive the instructions to reset your password.
          </p>
          <p className="main-p">Enter your email</p>
          <form
            onSubmit={handleSubmit((data) => {
              if (Object.keys(errors).length === 0) {
                const email = data.email.toLowerCase();
                setEnteredEmail(email);
                forgotPassword({ variables: { email } });
              }
            })}
          >
            <input
              className="main-input"
              placeholder="Email"
              {...register("email", {
                required: "Please enter your email address",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email address is invalid",
                },
              })}
            />
            {errors.email && <InlineError text={errors.email.message!} />}
            <button className="main-btn block" type="submit">
              {mutationLoading ? <Loader /> : "Continue"}
            </button>
          </form>
        </>
      )}
      <style jsx>
        {`
          @import "../../index.scss";

          .forgot-password-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }
          }
        `}
      </style>
    </div>
  );
}
