require('dotenv').config();
const { ApolloServer, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const tokenPayload = require('./middleware/tokenPayload');

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    // Subscription context
    if (connection) {
      const user = tokenPayload(connection.context.authToken);
      return { user };
    }

    // Query & Mutation context
    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1];
    const user = tokenPayload(token);
    return { user };
  },
  subscriptions: {
    onConnect: async ({ authToken }) => {
      // Validate user token & throw err if not valid
      if (authToken) {
        const user = tokenPayload(authToken);
        if (!user) throw new AuthenticationError('Not Authenticated');
        return { user };
      }
      throw new AuthenticationError('Not Authenticated');
    },
  },
  introspection: true,
  playground: true,
});

// Start server
(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGO_PATH}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      sslValidate: false,
    });
    // Log query
    // mongoose.set('debug', true);
    // Server listener
    const { url, subscriptionsUrl } = await server.listen();
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
  } catch (err) {
    console.log(err);
  }
})();
