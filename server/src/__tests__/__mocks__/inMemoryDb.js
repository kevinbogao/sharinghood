const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Create MongoMemoryServer instance
const mongod = new MongoMemoryServer();

// Connect to in-memory DB
async function connect() {
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
async function close() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

// Clean data from in-memory DB
async function cleanup() {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.keys(collections).map((collection) =>
      collections[collection].deleteMany()
    )
  );
}

module.exports = { connect, close, cleanup };
