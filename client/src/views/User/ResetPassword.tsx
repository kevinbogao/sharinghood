// @ts-nocheck

import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useQuery, useMutation } from "@apollo/client";
import Spinner from "../../components/Spinner";
import InlineError from "../../components/InlineError";
import ServerError from "../../components/ServerError";
import { queries, mutations } from "../../utils/gql";
import { validateForm } from "../../utils/helpers";

export default function ResetPassword({ match }) {
  let password, confirmPassword;
  const [formError, setFormError] = useState({});
  const [success, setSuccess] = useState(false);
  const { loading, error, data } = useQuery(queries.VALIDATE_RESET_LINK, {
    variables: { resetKey: match.params.resetKey },
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [resetPassword, { loading: mutationLoading }] = useMutation(
    mutations.RESET_PASSWORD,
    {
      onCompleted: ({ resetPassword }) => {
        if (resetPassword) setSuccess(true);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    }
  );

  return loading ? (
    <Spinner />
  ) : error ? (
    <ServerError />
  ) : (
    <>
      <div className="reset-password-control">
        {data.validateResetLink ? (
          <>
            {success ? (
              <>
                <p className="main-p">
                  Your password has been successfully reset!
                </p>

                <button className="main-btn" type="button">
                  <Link to="/login">Back to login</Link>
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    const errors = validateForm(
                      { password, confirmPassword },
                      setFormError
                    );
                    if (Object.keys(errors).length === 0) {
                      resetPassword({
                        variables: {
                          resetKey: match.params.resetKey,
                          password: password.value,
                        },
                      });
                    }
                  }}
                >
                  <input
                    type="password"
                    className="main-input"
                    placeholder="Password"
                    ref={(node) => (password = node)}
                  />
                  {formError.password && (
                    <InlineError text={formError.password} />
                  )}
                  <input
                    type="password"
                    className="main-input"
                    placeholder="Confirm Password"
                    ref={(node) => (confirmPassword = node)}
                  />
                  {formError.confirmPassword && (
                    <InlineError text={formError.confirmPassword} />
                  )}
                  <button className="main-btn block" type="submit">
                    Confirm
                  </button>
                </form>
                {mutationLoading && <Spinner isCover />}
              </>
            )}
          </>
        ) : (
          <>
            <p className="main-p">Your link is not longer valid.</p>
            <Link to="/forgot-password">
              <button className="main-btn block" type="submit">
                Try again
              </button>
            </Link>
          </>
        )}
        <style jsx>
          {`
            @import "./src/assets/scss/index.scss";

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
    </>
  );
}

ResetPassword.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      resetKey: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
