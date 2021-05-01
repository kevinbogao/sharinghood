// require("dotenv").config();
import * as dotenv from "dotenv";
import { ApolloServer, AuthenticationError } from "apollo-server";
import Redis from "ioredis";
import mongoose from "mongoose";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import logger from "./utils/logger";
import { verifyToken, TokenPayload } from "./utils/authToken";

// Dotenv
dotenv.config();

// Create redis instance
const redis = new Redis(process.env.REDIS_URL);

// Create Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    reportSchema: true,
    // debugPrintReports: true,
  },
  plugins: [
    {
      // Log server request
      requestDidStart() {
        return {
          willSendResponse(requestContext: any) {
            // Log error if errors are encountered
            if (requestContext.response.errors) {
              logger.log(
                "error",
                `Request for ${requestContext.request.operationName}`,
                {
                  query: requestContext.request.query,
                  variables: requestContext.request.variables,
                  error: requestContext.response.errors[0].message,
                }
              );
              // Log request
            } else {
              logger.log(
                "info",
                `Request for ${requestContext.request.operationName}`,
                {
                  query: requestContext.request.query,
                  variables: requestContext.request.variables,
                }
              );
            }
          },
        };
      },
    },
  ],
  context: async ({ req, connection }: { req: any; connection: any }) => {
    // Subscription context
    if (connection) {
      const user: TokenPayload | null = verifyToken(
        connection.context.authToken
      );
      if (user) return { user };
    }

    // Query & Mutation context
    const tokenWithBearer = req.headers.authorization || "";
    const token = tokenWithBearer.split(" ")[1];
    const user: TokenPayload | null = verifyToken(token);
    return { ...(user && { user }), redis };
  },
  subscriptions: {
    // @ts-ignore
    onConnect: async ({ authToken }: { authToken: any }) => {
      // Validate user token & throw err if not valid
      if (authToken) {
        const user: TokenPayload | null = verifyToken(authToken);
        if (!user) throw new AuthenticationError("Not Authenticated");
        return { user };
      }
      throw new AuthenticationError("Not Authenticated");
    },
  },
  cors: {
    credentials: true,
    origin: (origin: any, callback: any) => {
      if (origin) {
        const whitelist = [
          process.env.ORIGIN,
          process.env.ORIGIN_INSECURE,
          "http://localhost:4000",
        ];
        if (whitelist.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
        // Mobile client
      } else {
        callback(null, false);
      }
    },
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
      useFindAndModify: false,
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

// export all the important pieces for tests
module.exports = {
  typeDefs,
  resolvers,
  ApolloServer,
  server,
};
