require("dotenv").config();
import Koa from "koa";
import helmet from "koa-helmet";
import { ApolloServer, AuthenticationError } from "apollo-server-koa";
import mongoose from "mongoose";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import redis from "./utils/redis";
import { verifyToken } from "./utils/authToken";
import { requestLogger } from "./utils/logger";

// Create Koa
const app = new Koa();
app.use(helmet());

// Create Apollo server
const server: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  engine: { reportSchema: true },
  plugins: [requestLogger],
  context: (req: any) => {
    if (req.connection) {
      const user = verifyToken(req.connection.context.authToken);
      return { user };
    }

    // Query & Mutation context
    const tokenWithBearer = req.ctx.req.headers.authorization || "";
    const token = tokenWithBearer.split(" ")[1];
    const user = verifyToken(token);
    return { user, redis };
  },
  subscriptions: {
    onConnect: ({ authToken }: any) => {
      // Validate user token & throw err if not valid
      if (authToken) {
        const user = verifyToken(authToken);
        if (!user) throw new AuthenticationError("Not Authenticated");
        return { user };
      }
      throw new AuthenticationError("Not Authenticated");
    },
  },
});

const httpServer = app.listen({ port: process.env.PORT || 4000 }, async () => {
  await mongoose.connect(`${process.env.MONGO_PATH}`);

  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  console.log(
    `Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`
  );
});

server.applyMiddleware({
  app,
  cors: { origin: process.env.ORIGIN, credentials: true },
});
server.installSubscriptionHandlers(httpServer);
