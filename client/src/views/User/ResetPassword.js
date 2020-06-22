import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { gql, useQuery, useMutation } from '@apollo/client';
import InlineError from '../../components/InlineError';
import Loading from '../../components/Loading';

const VALIDATE_RESET_LINK = gql`
  query ValidateResetLink($userIdKey: String!) {
    validateResetLink(userIdKey: $userIdKey)
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($userIdKey: String!, $password: String!) {
    resetPassword(userIdKey: $userIdKey, password: $password)
  }
`;

function ResetPassword({ match }) {
  let password, confirmPassword;
  const [formError, setFormError] = useState({});
  const [success, setSuccess] = useState(false);
  const { loading, error, data } = useQuery(VALIDATE_RESET_LINK, {
    variables: { userIdKey: match.params.id },
    onError: ({ message }) => {
      console.log(message);
    },
  });
  const [resetPassword, { loading: mutationLoading }] = useMutation(
    RESET_PASSWORD,
    {
      onCompleted: ({ resetPassword }) => {
        if (resetPassword) setSuccess(true);
      },
      onError: ({ message }) => {
        console.log(message);
      },
    },
  );

  function validate() {
    const errors = {};
    if (!password.value) errors.password = 'Please enter your password';
    else if (password.value.length < 7)
      errors.password = 'Your password must be longer than 7 characters';
    if (password.value !== confirmPassword.value)
      errors.confirmPassword = 'Passwords do not match';
    setFormError(errors);
    return errors;
  }

  return loading ? (
    <Loading />
  ) : error ? (
    `Error! ${error.message}`
  ) : (
    <>
      <div className="reset-password-control">
        {data.validateResetLink ? (
          <>
            {success ? (
              <>
                <p className="prev-p">
                  Your password has been successfully reset!
                </p>

                <button className="prev-btn">
                  <Link to="/login">Back to login</Link>
                </button>
              </>
            ) : (
              <>
                <p className="prev-p">
                  Reset password instructions have been sent.
                </p>
                <p className="prev-p">
                  Please check your email to recover your account.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const errors = validate();
                    if (Object.keys(errors).length === 0) {
                      resetPassword({
                        variables: {
                          userIdKey: match.params.id,
                          password: password.value,
                        },
                      });
                    }
                  }}
                >
                  <input
                    type="password"
                    className="prev-input"
                    placeholder="Password"
                    ref={(node) => (password = node)}
                  />
                  {formError.password && (
                    <InlineError text={formError.password} />
                  )}
                  <input
                    type="password"
                    className="prev-input"
                    placeholder="Confirm Password"
                    ref={(node) => (confirmPassword = node)}
                  />
                  {formError.confirmPassword && (
                    <InlineError text={formError.confirmPassword} />
                  )}
                  <button className="prev-btn" type="submit">
                    Confirm
                  </button>
                </form>
                {mutationLoading && <Loading isCover />}
              </>
            )}
          </>
        ) : (
          <>
            <p className="prev-p">Your link is not longer valid.</p>

            <Link to="/forgot-password">
              <button className="prev-btn">Try again</button>
            </Link>
          </>
        )}
        <style jsx>
          {`
            @import './src/assets/scss/index.scss';

            .reset-password-control {
              margin: auto;

              @include sm {
                max-width: 300px;
                width: 80vw;
              }

              .prev-p {
                margin: 20px auto;
                max-width: 300px;
              }

              .prev-input {
                margin-top: 30px;
              }

              .prev-btn {
                display: block;
                margin-top: 30px;
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
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ResetPassword;
