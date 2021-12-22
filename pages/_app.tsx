import type { AppProps } from "next/app";
import Head from "next/head";
import jwtDecode from "jwt-decode";
import { useEffect } from "react";
import {
  split,
  makeVar,
  createHttpLink,
  ApolloLink,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import Navbar from "../components/Navbar";
import NotificationBanner from "../components/NotificationBanner";
import { Auth } from "../lib/types";
import { AccessToken } from "../lib/auth";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_HTTP!,
});

const authLink = setContext(async (_, { headers }) => {
  const accessToken = localStorage.getItem("@sharinghood:accessToken");
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  };
});

const splitLink = process.browser
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      new WebSocketLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_WS!,
        options: {
          reconnect: true,
          connectionParams: () => ({
            authToken: localStorage.getItem("@sharingplatform:accessToken"),
          }),
        },
      }),
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        communityId: { read: () => communityIdVar() },
        accessToken: { read: () => accessTokenVar() },
        refreshToken: { read: () => refreshTokenVar() },
        tokenPayload: { read: () => tokenPayloadVar() },
        createCommunityDataVar: { read: () => createCommunityDataVar() },
      },
    },
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink<Auth>({
      isTokenValidOrUndefined() {
        const accessToken = localStorage.getItem("@sharinghood:accessToken");
        if (accessToken) {
          const { exp } = jwtDecode<AccessToken>(accessToken);
          if (Date.now() >= exp * 1000) return false;
        }
        return true;
      },
      accessTokenField: "tokens",
      fetchAccessToken() {
        return fetch(
          `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_HTTP!}/token_refresh`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "@sharinghood:refreshToken"
              )}`,
            },
          }
        );
      },
      handleFetch({ accessToken, refreshToken }) {
        localStorage.setItem("@sharinghood:accessToken", accessToken);
        localStorage.setItem("@sharinghood:refreshToken", refreshToken);
      },
      handleError(err) {
        if (err) {
          localStorage.removeItem("@sharinghood:accessToken");
          localStorage.removeItem("@sharinghood:refreshToken");
        }
      },
    }),
    onError(({ graphQLErrors, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach((err) => {
          if (err.extensions.code === "UNAUTHENTICATED") {
            localStorage.removeItem("@sharinghood:accessToken");
            localStorage.removeItem("@sharinghood:refreshToken");
            accessTokenVar(null);
            refreshTokenVar(null);
            tokenPayloadVar(null);
            return forward(operation);
          }
          return forward(operation);
        });
      }
    }),
    splitLink,
  ]),
  cache,
});

export interface CreateCommunityData {
  isCreator: boolean;
  communityId?: string;
  communityName: string;
  communityCode: string;
  communityZipCode?: string;
}

export const communityIdVar = makeVar<string | null>(null);
export const accessTokenVar = makeVar<string | null>(null);
export const refreshTokenVar = makeVar<string | null>(null);
export const tokenPayloadVar = makeVar<AccessToken | null>(null);
export const createCommunityDataVar = makeVar<CreateCommunityData | null>(null);

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const accessToken = localStorage.getItem("@sharinghood:accessToken");
    communityIdVar(localStorage.getItem("@sharinghood:communityId"));
    accessTokenVar(accessToken);
    refreshTokenVar(localStorage.getItem("@sharinghood:refreshToken"));
    tokenPayloadVar(accessToken ? jwtDecode<AccessToken>(accessToken) : null);
  }, []);

  return (
    <ApolloProvider client={client}>
      <Head>
        <title>Sharinghood</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NotificationBanner />
      <Navbar />
      <div className="base-control">
        <Component {...pageProps} />
      </div>
      <style jsx global>
        {`
          @import "./index.scss";

          #__next {
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          html,
          body,
          * {
            font-family: $font-stack;
            margin: 0;
            padding: 0;
            text-decoration: none;
          }

          button {
            &:hover {
              cursor: pointer;
            }
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          ::selection {
            background: $orange-bg;
          }

          ::-moz-selection {
            background: $orange-bg;
          }

          .main-p {
            display: block;
            font-size: 20px;
            margin: 20px auto;
            color: $black;
            max-width: 300px;

            &.mid {
              font-size: 18px;
              margin: 10px 0;
            }

            &.small {
              margin: 16px 0;
              font-size: 16px;
            }

            &.new {
              margin: 14px 0 7px 0;
              font-size: 16px;

              @include sm {
                max-width: 240px;
              }
            }

            &.full {
              max-width: 80vw;
              margin: auto;
            }
          }

          .main-input {
            display: block;
            background: $grey-000;
            margin-top: 30px;
            border-width: 0;
            padding: 10px;
            color: #a0998f;
            font-size: 20px;
            width: 280px;

            &.modal {
              margin: 0 auto;
            }

            &.date {
              margin: 0 auto;
            }

            &.new {
              margin: initial;
              max-width: 300px;

              @include sm {
                width: 70vw;
                max-width: 80vw;
              }

              &::placeholder {
                font-size: 17px;
              }
            }
          }

          .main-select {
            font-size: 20px;
            padding-left: 10px;
            padding-right: 10px;
            color: #a0998f;
            width: 300px;
            height: 43px;
            border-width: 0px;
            background: $grey-000;

            @include sm {
              width: 100%;
            }
          }

          .main-btn {
            height: 43px;
            width: 300px;
            background: $orange;
            border-width: 0;
            border-radius: 4px;
            color: $background;
            font-family: $font-stack;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;

            &.block {
              margin: 30px auto auto auto;
            }

            &.modal {
              margin: 20px auto 20px auto;
              padding: 8px 15px;
            }

            &.bottom {
              margin-bottom: 40px;
            }

            &.grey {
              background: $grey-300;
            }

            &.beige {
              background: $beige;
            }

            &.new {
              height: initial;
              width: initial;
              min-width: 120px;
              display: block;
              margin: 30px auto 10px auto;
              padding: 7px 15px;
              font-size: 16px;
              font-weight: 600;
              color: $background;
              border: none;
              border-radius: 10px;
            }

            &.item {
              width: max-content;
              height: 40px;
              border-width: 0;
              border-radius: 4px;
              cursor: pointer;
              color: $background;
              font-size: 20px;
              margin: 20px auto;
              padding: 4px 18px;
            }
          }

          .main-checkbox {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            margin: 14px 0;

            p {
              margin-left: 10px;
              font-size: 16px;
              color: $black;
              max-width: 280px;
            }

            input {
              margin-top: 4px;
            }
          }

          .switch-btn {
            margin: 0 auto;
            display: block;
            font-size: 19px;
            background: none;
            border-width: 0;
            cursor: pointer;
            width: 100%;
            padding: 5px;
            color: $black;

            &:hover {
              background: $grey-100;
            }

            &.active {
              font-weight: bold;
              color: $orange;
            }

            @include md {
              font-size: 18px;
            }
          }

          .switch-btn-separator {
            background: $grey-300;
            width: 2px;
          }

          .noti-btn {
            border: none;
            color: $black;
            font-size: 17px;
            width: 85px;
            height: 30px;
            border-radius: 15px;

            &.status {
              width: 160px;
            }

            &.pending {
              border: 2px solid $beige;
              background: $background;
            }

            &.accept {
              border: 2px solid $green-100;
              background: $green-000;
            }

            &.deny {
              border: 2px solid $red-100;
              background: $red-000;
            }

            &.request {
              border: 2px solid $black;
              background: $background;
            }
          }

          .font-icon {
            font-size: 18px;

            &.orange {
              color: $orange;
            }
          }

          .react-modal {
            position: absolute;
            top: 50%;
            left: 50%;
            right: auto;
            bottom: auto;
            border: 0px solid #cccccc;
            background: #ffffff;
            overflow: auto;
            border-radius: 4px;
            outline: none;
            padding: 30px;
            transform: translate(-50%, -50%);
            box-shadow: $white 0px 0px 6px;

            &.terms {
              max-width: $xl-max-width;
              max-height: 70vh;
              padding: 30px 50px;

              @include xl {
                width: 80vw;
              }

              @include sm {
                max-height: 85vh;
                padding: 20px;
              }
            }
          }

          .request-notification {
            position: absolute;
            top: 0;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            background: $orange;
            font-size: 14px;
            z-index: 7000;
            box-shadow: 0px 2px 4px $grey-200;

            p {
              margin: 6px;

              @include sm {
                margin-right: 20px;
              }
            }

            span {
              text-decoration: underline;
              font-weight: bold;

              &:hover {
                cursor: pointer;
              }
            }
          }

          .base-control {
            margin-top: 3px;
            flex: 1 1 0%;
            display: flex;
            overflow-y: scroll;
            justify-content: center;
          }
        `}
      </style>
    </ApolloProvider>
  );
}
