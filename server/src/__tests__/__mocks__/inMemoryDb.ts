import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Create MongoMemoryServer instance
const mongod = new MongoMemoryServer();

// Connect to in-memory DB
export async function connect(): Promise<void> {
  // Generate connection uri
  const uri = await mongod.getUri();

  // Mongoose connection to in-memory DB
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false,
  });
}

// Close from in-memory DB
export async function close(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

// Clean data from in-memory DB
export async function cleanup(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.keys(collections).map((collection) =>
      collections[collection].deleteMany({})
    )
  );
}
