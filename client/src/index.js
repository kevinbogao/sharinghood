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
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/link-ws';
import { setContext } from 'apollo-link-context';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode from 'jwt-decode';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Dotenv config
require('dotenv').config();

// Get accessToken from localStorage
const accessToken = localStorage.getItem('@sharinghood:accessToken');

// Create an http link
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP,
  credentials: 'include',
});

// Auth headers
const authLink = setContext((_, { headers }) => {
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
    connectionParams: {
      authToken: accessToken,
    },
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
const cache = new InMemoryCache();

// Init apollo client
const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: 'accessToken',
      isTokenValidOrUndefined: () => {
        if (!accessToken) return true;

        try {
          // Get expiration data on accessToken
          const { exp } = jwtDecode(accessToken);

          // Check if accessToken if expired return false if not
          // else return true
          if (Date.now() >= exp * 1000) return false;
          return true;
        } catch (err) {
          return false;
        }
      },
      fetchAccessToken: () => {
        // Fetch refreshToken from graphql endpoint
        const response = fetch(process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation {
                tokenRefresh
              }
            `,
          }),
        });

        // Return response
        return response;
      },
      handleResponse: () => async (response) => {
        // Get response data
        const { data } = await response.json();

        // Save accessToken to localStorage if it is returned from server
        if (data.tokenRefresh) {
          localStorage.setItem('@sharinghood:accessToken', data.tokenRefresh);
        }
      },
      handleError: (err) => {
        console.warn('Your refresh token is invalid. Try to re-login');
        console.error(err);
      },
    }),
    splitLink,
  ]),
  cache,
});

// Init cache values
cache.writeQuery({
  query: gql`
    query {
      accessToken
      tokenPayload
    }
  `,
  data: {
    accessToken: localStorage.getItem('@sharinghood:accessToken'),
    refreshToken: localStorage.getItem('@sharinghood:refreshToken'),
    tokenPayload: accessToken ? jwtDecode(accessToken) : null,
  },
});

render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
