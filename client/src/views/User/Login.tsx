import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { History } from "history";
import { useMutation } from "@apollo/client";
import jwtDecode from "jwt-decode";
import InlineError from "../../components/InlineError";
import Spinner from "../../components/Spinner";
import { mutations } from "../../utils/gql";
import {
  accessTokenVar,
  refreshTokenVar,
  tokenPayloadVar,
  TokenPayload,
} from "../../utils/cache";
import { validateForm, setErrorMsg, FormError } from "../../utils/helpers";

interface LoginData {
  accessToken: string;
  refreshToken: string;
}

export default function Login({
  history,
  location,
}: {
  history: History;
  location: any;
}) {
  // Get communityCode from props if user is directed from CommunityExists
  // else set it as null
  let email: HTMLInputElement | null;
  let password: HTMLInputElement | null;
  const { communityCode } = location.state || { communityCode: null };
  const [error, setError] = useState<FormError>({});
  const [login, { loading: mutationLoading }] = useMutation<
    { login: LoginData },
    { email: string; password: string }
  >(mutations.LOGIN, {
    onCompleted: async ({ login }) => {
      const tokenPayload: TokenPayload = await jwtDecode(login.accessToken);
      localStorage.setItem("@sharinghood:accessToken", login.accessToken);
      localStorage.setItem("@sharinghood:refreshToken", login.refreshToken);
      accessTokenVar(login.accessToken);
      refreshTokenVar(login.refreshToken);
      tokenPayloadVar(tokenPayload);
      history.push({
        pathname: "/communities",
        state: {
          fromLogin: true,
          communityCode,
        },
      });
    },
    onError: ({ message }: { message: string }) => {
      setErrorMsg(message, setError);
    },
  });

  return (
    <div className="login-control">
      <p className="main-p">Login and start sharing!</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = validateForm({ email, password }, setError);
          if (Object.keys(errors).length === 0 && email && password) {
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
