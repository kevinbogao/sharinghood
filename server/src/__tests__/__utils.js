const { ApolloServer } = require('apollo-server');
const typeDefs = require('../typeDefs');
const resolvers = require('../resolvers');

// Integration test unit
function constructTestServer({ context }) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  return { server };
}

module.exports = { constructTestServer };
