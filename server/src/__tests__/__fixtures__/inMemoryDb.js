const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Create MongoMemoryServer instance
const mongod = new MongoMemoryServer();

// Connect to in-memory DB
async function connect() {
  // Generate connection uri
  const uri = await mongod.getConnectionString();

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

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}

module.exports = { connect, close, cleanup };
