const { ApolloServer } = require('apollo-server');
// const mongoose = require('mongoose');
const typeDefs = require('../schema');
const resolvers = require('../resolvers');
const { context: defaultContext } = require('../');
// const { mockCommunity01Id } = require('./database/setup');

// Integration test unit
function constructTestServer({ context = defaultContext } = {}) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  return { server };
}

// // Connect to test database
// async function connectToTestDB() {
//   try {
//     await mongoose.connect(`${process.env.MONGO_TEST_URI}`, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//       useFindAndModify: false,
//       sslValidate: false,
//     });
//   } catch (err) {
//     throw new Error(err);
//   }
// }

// // Drop test database
// async function dropTestDB() {
//   // if (process.env.NODE_ENV === 'test') {
//   try {
//     await mongoose.connection.db.dropDatabase();
//   } catch (err) {
//     console.error(err);
//   }
//   // }
// }

// // Disconnect from test database
// async function closeTestDBConnection() {
//   try {
//     await mongoose.connection.close();
//   } catch (err) {
//     console.error(err);
//   }
// }

// /**
//  * Mock test data
//  */

// // Mock response for uploadImg (to cloudinary) function
// const mockUploadResponse = {
//   public_id: 'w9hb72biqpmowzyhwohy',
//   version: 1582569792,
//   signature: '01618b305be0f0a0035727f761946ee17baaad03',
//   width: 213,
//   height: 213,
//   format: 'png',
//   resource_type: 'image',
//   created_at: '2020-02-24T18:43:12Z',
//   tags: [],
//   bytes: 8582,
//   type: 'upload',
//   etag: '7ef2ec78ef5314bbad366054d2fc4399',
//   placeholder: false,
//   url:
//     'http://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png',
//   secure_url:
//     'https://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png',
// };

// /**
//  * Mock input data
//  */

// // Mock userInput for create community
// const mockCommunityCreatorUserInput = {
//   name: 'test1',
//   email: 'test1@email.com',
//   password: '1234567',
//   apartment: '123',
//   isNotified: true,
//   isCreator: true,
// };

// // Mock community input for register user
// const mockRegisterUserCommunityInput = {
//   name: 'community1',
//   code: 'community1',
//   zipCode: '10001',
// };

// // Mock userInput for existing community
// const mockExistingCommunityUserInput = {
//   name: 'test1',
//   email: 'test1@email.com',
//   password: '1234567',
//   apartment: '123',
//   isNotified: true,
//   communityId: mockCommunity01Id,
// };

module.exports = {
  constructTestServer,
  // connectToTestDB,
  // dropTestDB,
  // closeTestDBConnection,
  // mockUploadResponse,
  // mockCommunityCreatorUserInput,
  // mockRegisterUserCommunityInput,
  // mockExistingCommunityUserInput,
};
