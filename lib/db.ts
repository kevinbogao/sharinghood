import { createConnection, getConnection, Connection } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import entities from "../api/entities";

let connectionReadyPromise: Promise<Connection> | null = null;

export function prepareConnection(): Promise<Connection> {
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
}
