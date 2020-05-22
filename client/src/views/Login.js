import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
import InlineError from '../components/InlineError';
import Loading from '../components/Loading';

const GET_TOKEN = gql`
  {
    token @client
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      tokenExpiration
      userId
      userName
      communityId
    }
  }
`;

function Login({ location, history }) {
  const client = useApolloClient();
  let email, password;
  const [error, setError] = useState({});
  const { from } = location.state || { from: { pathname: '/' } };
  const {
    data: { token },
  } = useQuery(GET_TOKEN);
  const [login, { loading: mutationLoading }] = useMutation(LOGIN, {
    onCompleted: ({ login: { token, userId, userName, communityId } }) => {
      localStorage.setItem('@sharinghood:token', token);
      localStorage.setItem('@sharinghood:userId', userId);
      localStorage.setItem('@sharinghood:userName', userName);
      localStorage.setItem('@sharinghood:communityId', communityId);
      client.writeQuery({
        query: gql`
          {
            token
            userId
            userName
            communityId
          }
        `,
        data: { token, userId, userName, communityId },
      });
      history.push('/find');
    },
    onError: ({ message }) => {
      setError({ password: message });
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

  return token ? (
    <Redirect to={from} />
  ) : (
    <div className="login-control">
      <p className="prev-p">Login and start sharing!</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validate(email, password);
          if (Object.keys(errors).length === 0) {
            login({
              variables: {
                email: email.value,
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

Login.defaultProps = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: '/',
      }),
    }),
  }),
};

export default Login;
