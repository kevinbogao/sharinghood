import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import jwtDecode from 'jwt-decode';
import Loading from '../components/Loading';
import InlineError from '../components/InlineError';

const REGISTER = gql`
  mutation Register($userInput: UserInput!) {
    register(userInput: $userInput)
  }
`;

function Register({
  location: {
    state: { name, image, communityId, apartment, isCreator },
  },
  history,
}) {
  const client = useApolloClient();
  let email, password, confirmPassword, isNotified, agreed;
  const [error, setError] = useState({});
  const [
    register,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(REGISTER, {
    onError: ({ message }) => {
      console.log(message);
    },
    onCompleted: ({ register }) => {
      localStorage.setItem('@sharinghood:accessToken', register);
      const tokenPayload = jwtDecode(register);
      client.writeQuery({
        query: gql`
          {
            accessToken
            tokenPayload
          }
        `,
        data: { accessToken: register, tokenPayload },
      });
      history.push('/find');
    },
  });

  function validate() {
    const errors = {};
    if (!email.value) errors.email = 'Please enter your email address';
    else if (!/\S+@\S+\.\S+/.test(email.value))
      errors.email = 'Email address is invalid';
    if (!password.value) errors.password = 'Please enter your password';
    else if (password.value.length < 7)
      errors.password = 'Your password must be longer than 7 characters';
    if (password.value !== confirmPassword.value)
      errors.confirmPassword = 'Passwords do not match';
    if (!agreed.checked)
      errors.agreed = 'Please agree to the terms and conditions';
    setError(errors);
    return errors;
  }

  return (
    <div className="register-control">
      <p className="prev-p">Thank you, you are a hero already!</p>
      <p className="prev-p">Now create your login account.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            register({
              variables: {
                userInput: {
                  name,
                  email: email.value,
                  password: password.value,
                  image,
                  apartment,
                  communityId,
                  isNotified: isNotified.checked,
                  isCreator,
                },
              },
            });
          }
        }}
      >
        <input
          type="text"
          className="prev-input"
          placeholder="Email"
          ref={(node) => (email = node)}
        />
        {error.email && <InlineError text={error.email} />}
        {error.emailExists && <InlineError text={error.emailExists} />}
        <input
          type="password"
          className="prev-input"
          placeholder="Password"
          ref={(node) => (password = node)}
        />
        {error.password && <InlineError text={error.password} />}
        <input
          type="password"
          className="prev-input"
          placeholder="Confirm Password"
          ref={(node) => (confirmPassword = node)}
        />
        {error.confirmPassword && <InlineError text={error.confirmPassword} />}
        <div className="register-terms">
          <input type="checkbox" ref={(node) => (isNotified = node)} />
          <p>
            I want to get Notified when my neighbours request and share items
          </p>
        </div>
        <div className="register-terms">
          <input type="checkbox" ref={(node) => (agreed = node)} />
          <p>
            I agree to the{' '}
            <button type="button" className="terms-btn">
              terms and conditions
            </button>
          </p>
        </div>
        {error.agreed && <InlineError text={error.agreed} />}
        <button className="prev-btn" type="submit">
          Register
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      {mutationError && <p>Error :( Please try again</p>}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .register-control {
            margin: auto;

            @include sm {
              max-width: 300px;
            }

            .prev-p {
              margin: 20px auto;
            }

            .prev-input {
              margin-top: 30px;
            }

            .prev-btn {
              margin: 20px auto 30px auto;
            }

            .register-terms {
              display: flex;

              p {
                margin: 14px 0;
                font-size: 16px;
                color: $brown;
                max-width: 280px;
              }

              input {
                margin: 20px 10px 0 0;
              }
            }

            button.terms-btn {
              all: initial;
              border: none;
              margin: 0px !important;
              color: $green-100;
              font-family: $font-stack;
              text-decoration: underline;

              &:hover {
                cursor: pointer;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

Register.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      communityId: PropTypes.string.isRequired,
      apartment: PropTypes.string.isRequired,
      isCreator: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Register;
