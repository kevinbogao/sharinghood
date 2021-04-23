import React, { useState } from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import { setErrorMsg, validateForm } from "../../utils/helpers";

const GET_ACCESS_TOKEN = gql`
  {
    accessToken @client
  }
`;

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

function ForgotPassword({ location }) {
  let email;
  const { from } = location.state || { from: { pathname: "/" } };
  const [error, setError] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReSend, setIsReSend] = useState(false);
  const {
    data: { accessToken },
  } = useQuery(GET_ACCESS_TOKEN);
  const [forgotPassword, { loading: mutationLoading }] = useMutation(
    FORGOT_PASSWORD,
    {
      onCompleted: ({ forgotPassword }) => {
        // Set success if true is returned
        if (forgotPassword) setIsSuccess(true);
      },
      onError: ({ message }) => {
        setErrorMsg(message, setError);
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
                const errors = validateForm({ email }, setError);
                if (Object.keys(errors).length === 0) {
                  forgotPassword({
                    variables: { email: email.value.toLowerCase() },
                  });
                  // Stop render resend button for 5 sec, and re-render again
                  setIsReSend(true);
                  setTimeout(() => {
                    setIsReSend(false);
                  }, 5000);
                }
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
              const errors = validateForm({ email }, setError);
              if (Object.keys(errors).length === 0) {
                forgotPassword({
                  variables: { email: email.value.toLowerCase() },
                });
              }
            }}
          >
            <input
              className="main-input"
              type="text"
              placeholder="Email"
              // onChange={(e) => setEmail(e.target.value)}
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

ForgotPassword.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

ForgotPassword.defaultProps = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: "/",
      }),
    }),
  }),
};

export default ForgotPassword;
