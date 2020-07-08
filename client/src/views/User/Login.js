import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { gql, useMutation, useApolloClient } from '@apollo/client';
import jwtDecode from 'jwt-decode';
import InlineError from '../../components/InlineError';
import Loading from '../../components/Loading';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`;

function Login({ history, location }) {
  // Get communityCode from props if user is directed from CommunityExists
  // else set it as null
  let email, password;
  const { communityCode } = location.state || { communityCode: null };
  const client = useApolloClient();
  const [error, setError] = useState({});
  const [login, { loading: mutationLoading }] = useMutation(LOGIN, {
    onCompleted: async ({ login }) => {
      const tokenPayload = jwtDecode(login.accessToken);
      localStorage.setItem('@sharinghood:accessToken', login.accessToken);
      localStorage.setItem('@sharinghood:refreshToken', login.refreshToken);
      client.writeQuery({
        query: gql`
          {
            accessToken
            refreshToken
            tokenPayload
          }
        `,
        data: {
          accessToken: login.accessToken,
          refreshToken: login.refreshToken,
          tokenPayload,
        },
      });
      history.push({
        pathname: '/communities',
        state: {
          fromLogin: true,
          communityCode,
        },
      });
    },
    onError: ({ message }) => {
      const errMsgArr = message.split(': ');
      const errMsgArrLen = errMsgArr.length;
      setError({
        [errMsgArr[errMsgArrLen - 2]]: errMsgArr[errMsgArrLen - 1],
      });
    },
  });

  function validate() {
    const errors = {};
    if (!email.value) errors.email = 'Please enter your email address';
    else if (!/\S+@\S+\.\S+/.test(email.value))
      errors.email = 'Email address is invalid';
    if (!password.value) errors.password = 'Please enter your password';
    setError(errors);
    return errors;
  }

  return (
    <div className="login-control">
      <p className="prev-p">Login and start sharing!</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate();
          if (Object.keys(errors).length === 0) {
            login({
              variables: {
                email: email.value.toLowerCase(),
                password: password.value,
              },
            });
          }
        }}
      >
        <input
          className="prev-input"
          type="text"
          placeholder="Email"
          ref={(node) => (email = node)}
        />
        {error.email && <InlineError text={error.email} />}
        <input
          className="prev-input"
          type="password"
          placeholder="Password"
          ref={(node) => (password = node)}
        />
        {error.password && <InlineError text={error.password} />}
        <p className="prev-p">
          <Link to="/forgot-password">
            <span>Forgot password?</span>
          </Link>
        </p>
        <p className="prev-p">
          Not a member yet?{' '}
          <Link to="/">
            <span>Become now!</span>
          </Link>
        </p>
        <button className="prev-btn" type="submit">
          Login
        </button>
      </form>
      {mutationLoading && <Loading isCover />}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .login-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            .prev-p {
              margin: 20px auto;

              span {
                color: $green-100;
              }
            }

            .prev-input {
              margin-top: 30px;
            }
          }
        `}
      </style>
    </div>
  );
}

Login.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      communityCode: PropTypes.string,
    }),
  }).isRequired,
};

export default Login;
