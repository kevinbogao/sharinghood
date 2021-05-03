import { ApolloServer } from "apollo-server";
import typeDefs from "../typeDefs";
import resolvers from "../resolvers";

// Integration test unit
export function constructTestServer({ context }: any) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  return { server };
}
