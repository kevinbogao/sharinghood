import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import InlineError from '../../components/InlineError';
import Loading from '../../components/Loading';

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String, $uuidKey: String) {
    forgotPassword(email: $email, uuidKey: $uuidKey)
  }
`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState({});
  const [uuidKey, setUuidKey] = useState(null);
  const [forgotPassword, { loading: mutationLoading }] = useMutation(
    FORGOT_PASSWORD,
    {
      onCompleted: ({ forgotPassword }) => {
        // Set success if true is returned
        if (!!forgotPassword) setUuidKey(forgotPassword);
      },
      onError: ({ message }) => {
        setError({ email: message });
      },
    },
  );

  function validate() {
    const errors = {};
    if (!email) errors.email = 'Please enter your email address';
    setError(errors);
    return errors;
  }

  return (
    <div className="forgot-password-control">
      {uuidKey ? (
        <>
          <p className="prev-p">Reset password instructions have been sent.</p>
          <p className="prev-p">
            Please check your email to recover your account.
          </p>
          <button
            className="prev-btn"
            onClick={(e) => {
              e.preventDefault();
              const errors = validate();
              if (Object.keys(errors).length === 0) {
                forgotPassword({
                  variables: { email, uuidKey },
                });
              }
            }}
          >
            Resend
          </button>
        </>
      ) : (
        <>
          <p className="prev-p">
            You will receive the instructions to reset your password.
          </p>
          <p className="prev-p">Enter your email</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const errors = validate();
              if (Object.keys(errors).length === 0) {
                forgotPassword({
                  variables: { email },
                });
              }
            }}
          >
            <input
              className="prev-input"
              type="text"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            {error.email && <InlineError text={error.email} />}
            <button className="prev-btn" type="submit">
              Login
            </button>
          </form>
        </>
      )}
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .forgot-password-control {
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
  );
}

export default ForgotPassword;
