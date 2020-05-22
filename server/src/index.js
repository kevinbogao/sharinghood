require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const tokenPayload = require('./middleware/tokenPayload');

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, connection }) => {
    if (connection) {
      return null;
    } else {
      const tokenWithBearer = req.headers.authorization || '';
      const token = tokenWithBearer.split(' ')[1];
      const user = tokenPayload(token);
      return { user };
    }
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
    });
    // Server listener
    const { url, subscriptionsUrl } = await server.listen();
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
  } catch (err) {
    console.log(err);
  }
})();
