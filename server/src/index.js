require("dotenv").config();
const { ApolloServer, AuthenticationError } = require("apollo-server");
const Redis = require("ioredis");
const mongoose = require("mongoose");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const logger = require("./utils/loggger");
const { verifyToken } = require("./utils/authToken");

const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

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
          willSendResponse(requestContext) {
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
  context: async ({ req, connection }) => {
    // Subscription context
    if (connection) {
      const user = verifyToken(connection.context.authToken);
      return { user };
    }

    // Query & Mutation context
    const tokenWithBearer = req.headers.authorization || "";
    const token = tokenWithBearer.split(" ")[1];
    const user = verifyToken(token);
    return { user, redis };
  },
  subscriptions: {
    onConnect: async ({ authToken }) => {
      // Validate user token & throw err if not valid
      if (authToken) {
        const user = verifyToken(authToken);
        if (!user) throw new AuthenticationError("Not Authenticated");
        return { user };
      }
      throw new AuthenticationError("Not Authenticated");
    },
  },
  cors: {
    credentials: true,
    origin: (origin, callback) => {
      if (origin) {
        const whitelist = [process.env.ORIGIN, process.env.ORIGIN_INSECURE];
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
