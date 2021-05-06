import { StrictMode } from "react";
import { render } from "react-dom";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  ApolloProvider,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import { getMainDefinition } from "@apollo/client/utilities";
import jwtDecode from "jwt-decode";
import {
  accessTokenVar,
  refreshTokenVar,
  tokenPayloadVar,
  selCommunityIdVar,
  serverErrorVar,
  clearLocalStorageAndCache,
} from "./utils/cache";
import App from "./App";

// Dotenv config
require("dotenv").config();

// Create an http link
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP,
  credentials: "include",
});

// Auth headers
const authLink = setContext(async (_, { headers }) => {
  const accessToken = localStorage.getItem("@sharinghood:accessToken");
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  };
});

// Create an WebSocket link
const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_WS as string,
  options: {
    reconnect: true,
    connectionParams: () => ({
      authToken: localStorage.getItem("@sharinghood:accessToken"),
    }),
  },
});

// Split links
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Init cache
const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        accessToken: {
          read() {
            return accessTokenVar();
          },
        },
        refreshToken: {
          read() {
            return refreshTokenVar();
          },
        },
        tokenPayload: {
          read() {
            return tokenPayloadVar();
          },
        },
        selCommunityId: {
          read() {
            return selCommunityIdVar();
          },
        },
        serverError: {
          read() {
            return serverErrorVar();
          },
        },
      },
    },
    Notification: {
      fields: {
        messages: {
          merge(existing, incoming) {
            // If the length of incoming messages array is shorter than
            // the existing messages array, return the existing messages
            if (incoming?.length < existing?.length) return existing;
            return incoming;
          },
        },
      },
    },
  },
});

// Init apollo client
const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink<any>({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: (): boolean => {
        const accessToken = localStorage.getItem("@sharinghood:accessToken");

        // Return false if accessToken is not expired
        if (accessToken) {
          const { exp }: { exp: number } = jwtDecode(accessToken);
          if (Date.now() >= exp * 1000) return false;
        }

        return true;
      },
      handleFetch: () => {},
      fetchAccessToken: async () => {
        const res = await fetch(
          process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP as string,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
              mutation TokenRefresh($token: String!) {
                tokenRefresh(token: $token) {
                  accessToken
                  refreshToken
                }
              }
            `,
              variables: {
                token: localStorage.getItem("@sharinghood:refreshToken"),
              },
            }),
          }
        );

        return res.json();
      },
      handleResponse: () => (res: any) => {
        if (res.data.tokenRefresh) {
          localStorage.setItem(
            "@sharinghood:accessToken",
            res.data.tokenRefresh.accessToken
          );
          localStorage.setItem(
            "@sharinghood:refreshToken",
            res.data.tokenRefresh.refreshToken
          );
        }
      },
      handleError: ({ message }) => {
        if (message === "Failed to fetch") {
          console.warn("Network error. Please try to login again");
          clearLocalStorageAndCache();
        }
      },
    }),
    onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach((err: any) => {
          if (err.extensions.code === "UNAUTHENTICATED") {
            clearLocalStorageAndCache();
            return forward(operation);
          }
          return forward(operation);
        });
      }

      // Set global serverError to true in case of server errors
      if (networkError) {
        serverErrorVar(true);
        return forward(operation);
      }
    }),
    splitLink,
  ]),
  cache,
});

render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
  document.getElementById("root")
);
