const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../../models/user');
const Post = require('../../models/post');
const Community = require('../../models/community');

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

const updatedMockUploadResponse = {
  asset_id: '95baa1dfe24e3ab86f3343ee32512752',
  public_id: 'hp0ffukc6xoeipwm929c',
  version: 1594160379,
  version_id: 'daaedb96a3446b3d94c648355355a6a8',
  signature: '306736485677e3e16f8a2ef482830a400ee6ec90',
  width: 213,
  height: 213,
  format: 'png',
  resource_type: 'image',
  created_at: '2020-07-07T22:19:39Z',
  tags: [],
  bytes: 8582,
  type: 'upload',
  etag: '7ef2ec78ef5314bbad366054d2fc4399',
  placeholder: false,
  url:
    'http://res.cloudinary.com/dc87yxcas/image/upload/v1594160379/hp0ffukc6xoeipwm929c.png',
  secure_url:
    'https://res.cloudinary.com/dc87yxcas/image/upload/v1594160379/hp0ffukc6xoeipwm929c.png',
};

// Create mock user & community mongoose ids
const mockUser01Id = new mongoose.Types.ObjectId();
const mockUser02Id = new mongoose.Types.ObjectId();
const mockPost01Id = new mongoose.Types.ObjectId();
const mockCommunity01Id = new mongoose.Types.ObjectId();
const mockCommunity02Id = new mongoose.Types.ObjectId();

// Mock user01
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
  posts: [mockPost01Id],
};

// Mock user02
const mockUser02 = {
  _id: mockUser02Id,
  name: 'MockUser02',
  email: 'mock.user02@email.com',
  password: '1234567',
  apartment: '002',
  isNotified: true,
  isCreator: true,
  image: JSON.stringify(mockUploadResponse),
  communities: [mockCommunity02Id],
};

// Mock community01
const mockCommunity01 = {
  _id: mockCommunity01Id,
  name: 'Mock Community 01',
  code: 'mockCommunity01',
  zipCode: '00001',
  creator: mockUser01Id,
  members: [mockUser01Id],
};

// Mock community02
const mockCommunity02 = {
  _id: mockCommunity02Id,
  name: 'Mock Community 02',
  code: 'mockCommunity02',
  zipCode: '00002',
  creator: mockUser02Id,
  members: [mockUser02Id],
};

// Mock post01
const mockPost01 = {
  _id: mockPost01Id,
  title: 'Mock Post 01',
  desc: 'mockPost01',
  image: JSON.stringify(mockUploadResponse),
  condition: 0,
  isGiveaway: true,
  creator: mockUser01,
};

async function createInitData() {
  try {
    // Hash password for mock user 01 & mock user 02
    const [mockUser01PasswordHash, mockUser02PasswordHash] = await Promise.all([
      bcryptjs.hash(mockUser01.password, 12),
      bcryptjs.hash(mockUser02.password, 12),
    ]);

    // Write initial data to datebase
    await Promise.all([
      User.create([
        {
          ...mockUser01,
          password: mockUser01PasswordHash,
        },
        {
          ...mockUser02,
          password: mockUser02PasswordHash,
        },
      ]),
      Community.create([mockCommunity01, mockCommunity02]),
      Post.create(mockPost01),
    ]);
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  createInitData,
  mockUser01,
  mockUser01Id,
  mockCommunity01,
  mockCommunity01Id,
  mockUser02,
  mockUser02Id,
  mockCommunity02,
  mockCommunity02Id,
  mockUploadResponse,
  updatedMockUploadResponse,
};
