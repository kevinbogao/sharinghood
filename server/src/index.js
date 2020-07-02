require('dotenv').config();
const { ApolloServer, AuthenticationError } = require('apollo-server');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { verifyToken } = require('./utils/authToken');

// Create redis instance
const redis = new Redis(process.env.REDIS_URL);

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    // Subscription context
    if (connection) {
      const user = verifyToken(connection.context.authToken);
      return { user };
    }

    // Query & Mutation context
    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1];
    const user = verifyToken(token);
    return { user, redis };
  },
  subscriptions: {
    onConnect: async ({ authToken }) => {
      // Validate user token & throw err if not valid
      if (authToken) {
        const user = verifyToken(authToken);
        if (!user) throw new AuthenticationError('Not Authenticated');
        return { user };
      }
      throw new AuthenticationError('Not Authenticated');
    },
  },
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
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
    // Server listener
    const { url, subscriptionsUrl } = await server.listen({
      port: process.env.PORT || 4000,
    });
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
  } catch (err) {
    console.log(err);
  }
})();
