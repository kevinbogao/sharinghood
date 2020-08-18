import React from 'react';
import { render } from 'react-dom';
import {
  gql,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  ApolloProvider,
  ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { getMainDefinition } from '@apollo/client/utilities';
import jwtDecode from 'jwt-decode';
import TagManager from 'react-gtm-module';
import App from './App';

// Dotenv config
require('dotenv').config();

// Google Tag Manager config
const TAG_MANAGER_ARGS = {
  gtmId: process.env.REACT_APP_GTM_ID,
};

// Init Google Tag Manager Module
TagManager.initialize(TAG_MANAGER_ARGS);

// Create an http link
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP,
  credentials: 'include',
});

// Auth headers
const authLink = setContext(async (_, { headers }) => {
  const accessToken = localStorage.getItem('@sharinghood:accessToken');
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

// Create an WebSocket link
const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_WS,
  options: {
    reconnect: true,
    connectionParams: () => ({
      authToken: localStorage.getItem('@sharinghood:accessToken'),
    }),
  },
});

// Split links
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

// Init cache
const cache = new InMemoryCache({
  typePolicies: {
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
    new TokenRefreshLink({
      accessTokenField: 'accessToken',
      isTokenValidOrUndefined: () => {
        const accessToken = localStorage.getItem('@sharinghood:accessToken');

        if (accessToken) {
          const { exp } = jwtDecode(accessToken);
          // Return false if accessToken is not expired
          if (Date.now() >= exp * 1000) return false;
        }

        return true;
      },
      fetchAccessToken: async () => {
        const res = await fetch(process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
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
              token: localStorage.getItem('@sharinghood:refreshToken'),
            },
          }),
        });

        return res.json();
      },
      handleResponse: () => (res) => {
        if (res.data.tokenRefresh) {
          localStorage.setItem(
            '@sharinghood:accessToken',
            res.data.tokenRefresh.accessToken,
          );
          localStorage.setItem(
            '@sharinghood:refreshToken',
            res.data.tokenRefresh.refreshToken,
          );
        }
      },
      handleError: () => {
        console.log('Try to login again');
      },
    }),
    onError(({ graphQLErrors, operation, forward }) => {
      graphQLErrors.map((err) => {
        if (err.extensions.code === 'UNAUTHENTICATED') {
          localStorage.removeItem('@sharinghood:accessToken');
          localStorage.removeItem('@sharinghood:refreshToken');
          localStorage.removeItem('@sharinghood:selCommunityId');
          writeInitialData();
          return forward(operation);
        }
        return forward(operation);
      });
    }),
    splitLink,
  ]),
  cache,
  resolvers: {
    Mutation: {
      selectCommunity: (_, { communityId }, { cache }) => {
        // Store community id in localStorage
        localStorage.setItem('@sharinghood:selCommunityId', communityId);

        // Set community id in cache
        cache.writeQuery({
          query: gql`
            query {
              selCommunityId @client
            }
          `,
          data: {
            selCommunityId: communityId,
          },
        });
      },
    },
  },
});

// Default cache values
function writeInitialData() {
  const accessToken = localStorage.getItem('@sharinghood:accessToken');

  cache.writeQuery({
    query: gql`
      query {
        accessToken
        refreshToken
        tokenPayload
        selCommunityId
      }
    `,
    data: {
      accessToken: localStorage.getItem('@sharinghood:accessToken'),
      refreshToken: localStorage.getItem('@sharinghood:refreshToken'),
      selCommunityId: localStorage.getItem('@sharinghood:selCommunityId'),
      tokenPayload: accessToken ? jwtDecode(accessToken) : null,
    },
  });
}

// Init cache values
writeInitialData();

// Reset cache on logout
client.onClearStore(writeInitialData);

render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
