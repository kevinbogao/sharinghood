import { ApolloServer, AuthenticationError } from "apollo-server-micro";
import { Connection, createConnection, getConnection } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { GraphQLDatabaseLoader } from "@mando75/typeorm-graphql-loader";
import typeDefs from "../../api/typeDefs";
import resolvers from "../../api/resolvers";
import entities from "../../api/entities";
import { verifyToken } from "../../lib/auth";
import { redis } from "../../lib/redis";
import type { AccessToken } from "../../lib/types";

// let connectionReadyPromise: Promise<void> | null = null;

// export function prepareConnection(): Promise<void> {
//   if (!connectionReadyPromise) {
//     connectionReadyPromise = (async () => {
//       try {
//         const staleConnection = getConnection();
//         await staleConnection.close();
//       } catch (_) {}

//       const connection = await createConnection({
//         type: "postgres",
//         url: process.env.DATABASE_URL!,
//         ssl: { rejectUnauthorized: false },
//         synchronize: process.env.NODE_ENV !== "production",
//         entities,
//         namingStrategy: new SnakeNamingStrategy(),
//       });

//       return connection;
//     })();
//   }

//   return connectionReadyPromise;
// }

let connectionReadyPromise: Promise<Connection> | null = null;

export const prepareConnection = () => {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      try {
        const staleConnection = getConnection();
        await staleConnection.close();
      } catch (_) {}

      const connection = await createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
        synchronize: process.env.NODE_ENV !== "production",
        entities,
        namingStrategy: new SnakeNamingStrategy(),
      });

      return connection;
    })();
  }

  return connectionReadyPromise;
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }: any) => {
    if (connection) {
      const user = verifyToken<AccessToken>(connection.context.accessToken);
      if (!user) throw new AuthenticationError("Not Authenticated");
      return user;
    }

    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const user = verifyToken<AccessToken>(token);
    // await prepareConnection();
    const dbConnection = await prepareConnection();
    const loader = new GraphQLDatabaseLoader(dbConnection);
    return { user, connection: dbConnection, redis, loader };
  },
  subscriptions: { path: "/api" },
});

export const config = { api: { bodyParser: false } };

export default function graphqlWithSubscriptionHandler(req: any, res: any) {
  const oldOne = res.socket.server.apolloServer;
  if (oldOne && oldOne !== apolloServer) delete res.socket.server.apolloServer;

  if (!res.socket.server.apolloServer) {
    apolloServer.installSubscriptionHandlers(res.socket.server);
    res.socket.server.apolloServer = apolloServer;
    const handler = apolloServer.createHandler({ path: "/api" });
    res.socket.server.apolloServerHandler = handler;
    oldOne?.stop();
  }

  return res.socket.server.apolloServerHandler(req, res);
}
