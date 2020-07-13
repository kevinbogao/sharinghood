const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../../models/user');
const Community = require('../../models/community');

/**
 * Mock test data
 */

// Mock response for uploadImg (to cloudinary) function
const mockUploadResponse = {
  public_id: 'w9hb72biqpmowzyhwohy',
  version: 1582569792,
  signature: '01618b305be0f0a0035727f761946ee17baaad03',
  width: 213,
  height: 213,
  format: 'png',
  resource_type: 'image',
  created_at: '2020-02-24T18:43:12Z',
  tags: [],
  bytes: 8582,
  type: 'upload',
  etag: '7ef2ec78ef5314bbad366054d2fc4399',
  placeholder: false,
  url:
    'http://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png',
  secure_url:
    'https://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png',
};

// Create mock user & community mongoose ids
const mockUser01Id = new mongoose.Types.ObjectId();
const mockCommunity01Id = new mongoose.Types.ObjectId();

// Mock user
const mockUser01 = {
  _id: mockUser01Id,
  name: 'MockUser01',
  email: 'mock.user01@email.com',
  password: '1234567',
  apartment: '001',
  isNotified: true,
  isCreator: true,
  image: JSON.stringify(mockUploadResponse),
  communities: [mockCommunity01Id],
};

// Mock community
const mockCommunity01 = {
  _id: mockCommunity01Id,
  name: 'MockCommunity01',
  code: 'mockCommunity01',
  zipCode: '00001',
  creator: mockUser01Id,
  members: [mockUser01Id],
};

/**
 * Mock input data
 */

// Mock userInput for create community
const mockCommunityCreatorUserInput = {
  name: 'TestUser01',
  email: 'test.user01@email.com',
  password: '1234567',
  apartment: '101',
  isNotified: true,
  isCreator: true,
};

// Mock community input for register user
const mockRegisterUserCommunityInput = {
  name: 'TestCommunity01',
  code: 'testCommunity01',
  zipCode: '10001',
};

// Mock userInput for existing community
const mockExistingCommunityUserInput = {
  name: 'TestUser02',
  email: 'test.user02@email.com',
  password: '1234567',
  apartment: '102',
  isNotified: true,
  communityId: mockCommunity01Id.toString(),
};

// Connect to test database
async function connectToTestDB() {
  try {
    // Connect mongodb database
    await mongoose.connect(`${process.env.MONGO_TEST_URI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      sslValidate: false,
    });

    // Hash password for mock user 01
    const mockUser01PasswordHash = await bcryptjs.hash(mockUser01.password, 12);

    // Write initial data to datebase
    await Promise.all([
      User.create({
        ...mockUser01,
        password: mockUser01PasswordHash,
      }),
      Community.create(mockCommunity01),
    ]);
  } catch (err) {
    throw new Error(err);
  }
}

// TODO: setup env
// Drop test database
async function dropTestDB() {
  // if (process.env.NODE_ENV === 'test') {
  // }

  try {
    await mongoose.connection.db.dropDatabase();
  } catch (err) {
    console.error(err);
  }
}

// Disconnect from test database
async function closeTestDBConnection() {
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  mockUploadResponse,
  mockUser01Id,
  mockCommunity01Id,
  mockCommunityCreatorUserInput,
  mockRegisterUserCommunityInput,
  mockExistingCommunityUserInput,
  connectToTestDB,
  dropTestDB,
  closeTestDBConnection,
};
