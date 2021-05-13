import { useState } from "react";
import { Location } from "history";
import { Redirect } from "react-router-dom";
import { useMutation, useReactiveVar } from "@apollo/client";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import { mutations } from "../../utils/gql";
import { accessTokenVar } from "../../utils/cache";
import { validateForm, setErrorMsg, FormError } from "../../utils/helpers";

type State = { from: string };

interface ForgotPasswordProps {
  location: Location<State>;
}

export default function ForgotPassword({ location }: ForgotPasswordProps) {
  let email: HTMLInputElement | null;
  const accessToken = useReactiveVar(accessTokenVar);
  const { from } = location.state || { from: { pathname: "/" } };
  const [error, setError] = useState<FormError>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReSend, setIsReSend] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState<string | null>(null);
  const [forgotPassword, { loading: mutationLoading }] = useMutation(
    mutations.FORGOT_PASSWORD,
    {
      onCompleted: ({ forgotPassword }) => {
        // Set success if true is returned
        if (forgotPassword) setIsSuccess(true);
      },
      onError: (err, { message }) => {
        setErrorMsg(message, setError);
        console.log(err);
      },
    }
  );

  return accessToken ? (
    <Redirect to={from} />
  ) : (
    <div className="forgot-password-control">
      {isSuccess ? (
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
                forgotPassword({
                  variables: { email: enteredEmail },
                });
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
            onSubmit={(e) => {
              e.preventDefault();
              const errors = validateForm({ email });
              setError(errors);
              if (Object.keys(errors).length === 0) {
                setEnteredEmail(email!.value.toLowerCase());
                forgotPassword({
                  variables: { email: email?.value.toLowerCase() },
                });
              }
            }}
          >
            <input
              className="main-input"
              type="text"
              placeholder="Email"
              ref={(node) => (email = node)}
            />
            {error.email && <InlineError text={error.email} />}
            <button className="main-btn block" type="submit">
              Continue
            </button>
          </form>
        </>
      )}
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

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
