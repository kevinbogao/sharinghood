import React from 'react';
import { render } from 'react-dom';
import {
  gql,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  ApolloProvider,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/link-ws';
import { setContext } from 'apollo-link-context';
import App from './App';
import * as serviceWorker from './serviceWorker';

require('dotenv').config();

// Get token from localhost
const token = localStorage.getItem('@sharinghood:token');

// Create an http link
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_HTTP,
});

// Auth headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('@sharinghood:token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create an WebSocket link
const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT_WS,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: token,
    },
  },
});

// Split links
const link = split(
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
  link,
  cache,
  resolvers: {
    Query: {
      contacts: () => {
        console.log('something');
      },
    },
  },
});

// Init cache values
cache.writeQuery({
  query: gql`
    query {
      token
      userId
      userName
      communityId
    }
  `,
  data: {
    token: localStorage.getItem('@sharinghood:token'),
    userId: localStorage.getItem('@sharinghood:userId'),
    userName: localStorage.getItem('@sharinghood:userName'),
    communityId: localStorage.getItem('@sharinghood:communityId'),
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
