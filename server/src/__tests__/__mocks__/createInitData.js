const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../../models/user');
const Post = require('../../models/post');
const Thread = require('../../models/thread');
const Request = require('../../models/request');
const Message = require('../../models/message');
const Booking = require('../../models/booking');
const Community = require('../../models/community');
const Notification = require('../../models/notification');

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

const fcmToken =
  'f5ChaueMdf5yFb9kb0md3q:APA91bGMPQp5qdcn9xB6-u-__ovque0KkiouWKsaeZRxuaKK-ctV_BGdSBZmzcMqug9mrzFxWfJRvAkixSyTn0tUEmT7dCGck8fh8q7rGgC35pYY72h-ixKtxAa5PhS5y8N1ZworXW26';

// Create mock user & community mongoose ids
const mockUser01Id = new mongoose.Types.ObjectId();
const mockUser02Id = new mongoose.Types.ObjectId();
const mockUser03Id = new mongoose.Types.ObjectId();
const mockPost01Id = new mongoose.Types.ObjectId();
const mockPost02Id = new mongoose.Types.ObjectId();
const mockPost03Id = new mongoose.Types.ObjectId();
const mockThread01Id = new mongoose.Types.ObjectId();
const mockThread02Id = new mongoose.Types.ObjectId();
const mockBooking01Id = new mongoose.Types.ObjectId();
const mockRequest01Id = new mongoose.Types.ObjectId();
const mockRequest02Id = new mongoose.Types.ObjectId();
const mockCommunity01Id = new mongoose.Types.ObjectId();
const mockCommunity02Id = new mongoose.Types.ObjectId();
const mockNotification01Id = new mongoose.Types.ObjectId();
const mockNotification02Id = new mongoose.Types.ObjectId();
const mockNotification03Id = new mongoose.Types.ObjectId();

const mockMessage01Id = new mongoose.Types.ObjectId();
const mockMessage02Id = new mongoose.Types.ObjectId();
const mockMessage03Id = new mongoose.Types.ObjectId();

// Mock message01
const mockMessage01 = {
  _id: mockMessage01Id,
  text: 'Mock message 01 text for chat',
  sender: mockUser01Id,
  notification: mockNotification01Id,
};

const mockMessage02 = {
  _id: mockMessage02Id,
  text: 'Mock message 02 text for booking',
  sender: mockUser01Id,
  notification: mockNotification02Id,
};

const mockMessage03 = {
  _id: mockMessage03Id,
  text: 'Mock message 03 text for request',
  sender: mockUser01Id,
  notification: mockNotification03Id,
};

// Mock notification01
const mockNotification01 = {
  _id: mockNotification01Id,
  ofType: 0,
  messages: [mockMessage01Id],
  participants: [mockUser01Id, mockUser03Id],
  isRead: {
    [mockUser01Id]: false,
    [mockUser03Id]: false,
  },
  community: mockCommunity01Id,
};

// Mock notification02
const mockNotification02 = {
  _id: mockNotification02Id,
  ofType: 1,
  booking: mockBooking01Id,
  messages: [mockMessage02Id],
  participants: [mockUser01Id, mockUser03Id],
  isRead: {
    [mockUser01Id]: true,
    [mockUser03Id]: true,
  },
  community: mockCommunity01Id,
};

const mockNotification03 = {
  _id: mockNotification03Id,
  ofType: 2,
  post: mockPost03Id,
  messages: [mockMessage03Id],
  participants: [mockUser01Id, mockUser03Id],
  isRead: {
    [mockUser01Id]: false,
    [mockUser03Id]: false,
  },
  community: mockCommunity01Id,
};

// Mock user01
const mockUser01 = {
  _id: mockUser01Id,
  name: 'MockUser01',
  email: 'mock.user01@email.com',
  password: '1234567',
  apartment: '001',
  isNotified: true,
  isCreator: true,
  isMigrated: true,
  isAdmin: true,
  image: JSON.stringify(mockUploadResponse),
  communities: [mockCommunity01Id, mockCommunity02Id],
  posts: [mockPost01Id, mockPost02Id, mockPost03Id],
  requests: [mockRequest01Id, mockRequest02Id],
  notifications: [
    mockNotification01Id,
    mockNotification02Id,
    mockNotification03Id,
  ],
  fcmTokens: [fcmToken],
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
  isMigrated: true,
  isAdmin: false,
  image: JSON.stringify(mockUploadResponse),
  communities: [mockCommunity02Id],
  posts: [],
  requests: [],
  notifications: [],
};

// Mock user03
const mockUser03 = {
  _id: mockUser03Id,
  name: 'MockUser03',
  email: 'mock.user03@email.com',
  password:
    'pbkdf2_sha256$150000$snZYsk8O7sIu$cjmeydDZt1BGJK2T82tWWhK/cMHCxhex/yazi2TmNL8=',
  apartment: '003',
  isNotified: true,
  isCreator: true,
  isMigrated: false,
  isAdmin: false,
  image: JSON.stringify(mockUploadResponse),
  communities: [mockCommunity01Id, mockCommunity02Id],
  posts: [],
  requests: [],
  notifications: [
    mockNotification01Id,
    mockNotification02Id,
    mockNotification03Id,
  ],
};

// Mock community01
const mockCommunity01 = {
  _id: mockCommunity01Id,
  name: 'Mock Community 01',
  code: 'mockCommunity01',
  zipCode: '00001',
  creator: mockUser01Id,
  members: [mockUser01Id, mockUser03Id],
  posts: [mockPost01Id, mockPost02Id, mockPost03Id],
  requests: [mockRequest01Id, mockRequest02Id],
};

// Mock community02
const mockCommunity02 = {
  _id: mockCommunity02Id,
  name: 'Mock Community 02',
  code: 'mockCommunity02',
  zipCode: '00002',
  creator: mockUser02Id,
  members: [mockUser02Id, mockUser03Id],
  posts: [mockPost01Id],
};

// Mock booking01
const mockBooking01 = {
  _id: mockBooking01Id,
  post: mockPost01Id,
  status: 0,
  dateType: 0,
  booker: mockUser03Id,
  community: mockCommunity01,
};

// mock thread01
const mockThread01 = {
  _id: mockThread01Id,
  content: 'Comment on post01',
  poster: mockUser03Id,
  community: mockCommunity01Id,
};

// mock thread02
const mockThread02 = {
  _id: mockThread02Id,
  content: 'Comment on request01',
  poster: mockUser03Id,
  community: mockCommunity01Id,
};

// Mock post01
const mockPost01 = {
  _id: mockPost01Id,
  title: 'Mock Post 01',
  desc: 'mockPost01',
  image: JSON.stringify(mockUploadResponse),
  condition: 0,
  isGiveaway: true,
  creator: mockUser01Id,
  bookings: [mockBooking01Id],
  threads: [mockThread01Id],
};

// Mock post02
const mockPost02 = {
  _id: mockPost02Id,
  title: 'Mock Post 02',
  desc: 'mockPost02',
  image: JSON.stringify(mockUploadResponse),
  condition: 1,
  isGiveaway: false,
  creator: mockUser01Id,
  bookings: [],
  threads: [],
};

// Mock post03
const mockPost03 = {
  _id: mockPost03Id,
  title: 'Mock Post 03',
  desc: 'mockPost02 for mockRequest02',
  image: JSON.stringify(mockUploadResponse),
  condition: 2,
  isGiveaway: false,
  creator: mockUser01Id,
  bookings: [],
  threads: [],
};

// Mock request01
const mockRequest01 = {
  _id: mockRequest01Id,
  title: 'Mock Request 01',
  desc: 'mockRequest01',
  dateNeed: new Date(),
  dateReturn: new Date(),
  image: JSON.stringify(mockUploadResponse),
  creator: mockUser01Id,
  threads: [mockThread02Id],
};

// Mock request02
const mockRequest02 = {
  _id: mockRequest02Id,
  title: 'Mock Request 02',
  desc: 'mockRequest02',
  dateNeed: new Date(),
  dateReturn: new Date(),
  image: JSON.stringify(mockUploadResponse),
  creator: mockUser03Id,
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
        mockUser03,
      ]),
      Post.create([mockPost01, mockPost02, mockPost03]),
      Thread.create([mockThread01, mockThread02]),
      Booking.create([mockBooking01]),
      Request.create([mockRequest01, mockRequest02]),
      Message.create([mockMessage01, mockMessage02, mockMessage03]),
      Community.create([mockCommunity01, mockCommunity02]),
      Notification.create([
        mockNotification01,
        mockNotification02,
        mockNotification03,
      ]),
    ]);
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  createInitData,
  fcmToken,
  mockUser01,
  mockUser02,
  mockUser03,
  mockPost01,
  mockPost02,
  mockPost03,
  mockThread01,
  mockThread02,
  mockRequest01,
  mockRequest02,
  mockBooking01,
  mockMessage01,
  mockMessage02,
  mockMessage03,
  mockCommunity01,
  mockCommunity02,
  mockNotification01,
  mockNotification02,
  mockNotification03,
  mockUploadResponse,
  updatedMockUploadResponse,
};