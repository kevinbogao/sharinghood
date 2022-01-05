import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useMutation, useReactiveVar } from "@apollo/client";
import jwtDecode from "jwt-decode";
import { mutations } from "../lib/gql";
import { accessTokenVar, refreshTokenVar, tokenPayloadVar } from "./_app";
import { Loader, InlineError } from "../components/Container";
import { handlerInputError } from "../lib";
import type { LoginData, LoginVars } from "../lib/types";

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginVars>();
  const accessToken = useReactiveVar(accessTokenVar);
  const [login, { loading: mutationLoading }] = useMutation<
    LoginData,
    LoginVars
  >(mutations.LOGIN, {
    onCompleted({ login }) {
      accessTokenVar(login.accessToken);
      refreshTokenVar(login.refreshToken);
      tokenPayloadVar(jwtDecode(login.accessToken));
      localStorage.setItem("@sharinghood:accessToken", login.accessToken);
      localStorage.setItem("@sharinghood:refreshToken", login.refreshToken);
      router.push("/posts");
    },
    onError({ graphQLErrors }) {
      handlerInputError<LoginVars>(graphQLErrors, setError);
    },
  });

  useEffect(() => {
    if (accessToken) router.push("/communities");
    // eslint-disable-next-line
  }, [accessToken]);

  return (
    <div className="login-control">
      <p className="main-p">Login and start sharing!</p>
      <form
        onSubmit={handleSubmit((data) => {
          if (Object.keys(errors).length === 0) {
            login({
              variables: {
                email: data.email.toLowerCase(),
                password: data.password,
              },
            });
          }
        })}
      >
        <input
          className="main-input"
          placeholder="Email"
          {...register("email", {
            required: "Please enter your email address",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email address is invalid",
            },
          })}
        />
        {errors.email && <InlineError text={errors.email.message!} />}
        <input
          className="main-input"
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Please enter your password",
            minLength: {
              value: 7,
              message: "Your password must be longer than 7 characters",
            },
          })}
        />
        {errors.password && <InlineError text={errors.password.message!} />}
        <Link href="/account/reset">
          <a>
            <span className="main-p">Forgot password?</span>
          </a>
        </Link>
        <p className="main-p">
          Not a member yet?{" "}
          <Link href="/">
            <a>
              <span>Become now!</span>
            </a>
          </Link>
        </p>
        <button className="main-btn" type="submit">
          {mutationLoading ? <Loader /> : "Login"}
        </button>
      </form>
      <style jsx>
        {`
          @import "./index.scss";

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
