import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { gql, useMutation, useApolloClient } from "@apollo/client";
import jwtDecode from "jwt-decode";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import { validateForm } from "../../utils/helpers";

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
      localStorage.setItem("@sharinghood:accessToken", login.accessToken);
      localStorage.setItem("@sharinghood:refreshToken", login.refreshToken);
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
        pathname: "/communities",
        state: {
          fromLogin: true,
          communityCode,
        },
      });
    },
    onError: ({ message }) => {
      const errMsgArr = message.split(": ");
      setError({ [errMsgArr[0]]: errMsgArr[1] });
    },
  });

  return (
    <div className="login-control">
      <p className="main-p">Login and start sharing!</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm({ email, password }, setError);
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
          className="main-input"
          type="text"
          placeholder="Email"
          ref={(node) => (email = node)}
        />
        {error.email && <InlineError text={error.email} />}
        <input
          className="main-input"
          type="password"
          placeholder="Password"
          ref={(node) => (password = node)}
        />
        {error.password && <InlineError text={error.password} />}
        <p className="main-p">
          <Link to="/forgot-password">
            <span>Forgot password?</span>
          </Link>
        </p>
        <p className="main-p">
          Not a member yet?{" "}
          <Link to="/">
            <span>Become now!</span>
          </Link>
        </p>
        <button className="main-btn" type="submit">
          Login
        </button>
      </form>
      {mutationLoading && <Spinner isCover />}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .login-control {
            margin: auto;

            @include sm {
              max-width: 300px;
              width: 80vw;
            }

            span {
              color: $beige;
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
