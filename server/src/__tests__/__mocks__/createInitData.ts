import { Types } from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../../models/user";
import Post from "../../models/post";
import Thread from "../../models/thread";
import Request from "../../models/request";
import Message from "../../models/message";
import Booking from "../../models/booking";
import Community from "../../models/community";
import Notification from "../../models/notification";

// Mock response for uploadImg (to cloudinary) function
export const mockUploadResponse = {
  public_id: "w9hb72biqpmowzyhwohy",
  version: 1582569792,
  signature: "01618b305be0f0a0035727f761946ee17baaad03",
  width: 213,
  height: 213,
  format: "png",
  resource_type: "image",
  created_at: "2020-02-24T18:43:12Z",
  tags: [],
  bytes: 8582,
  type: "upload",
  etag: "7ef2ec78ef5314bbad366054d2fc4399",
  placeholder: false,
  url:
    "http://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png",
  secure_url:
    "https://res.cloudinary.com/dyr3b99uj/image/upload/v1582569792/w9hb72biqpmowzyhwohy.png",
};

export const updatedMockUploadResponse = {
  asset_id: "95baa1dfe24e3ab86f3343ee32512752",
  public_id: "hp0ffukc6xoeipwm929c",
  version: 1594160379,
  version_id: "daaedb96a3446b3d94c648355355a6a8",
  signature: "306736485677e3e16f8a2ef482830a400ee6ec90",
  width: 213,
  height: 213,
  format: "png",
  resource_type: "image",
  created_at: "2020-07-07T22:19:39Z",
  tags: [],
  bytes: 8582,
  type: "upload",
  etag: "7ef2ec78ef5314bbad366054d2fc4399",
  placeholder: false,
  url:
    "http://res.cloudinary.com/dc87yxcas/image/upload/v1594160379/hp0ffukc6xoeipwm929c.png",
  secure_url:
    "https://res.cloudinary.com/dc87yxcas/image/upload/v1594160379/hp0ffukc6xoeipwm929c.png",
};

export const fcmToken =
  "f5ChaueMdf5yFb9kb0md3q:APA91bGMPQp5qdcn9xB6-u-__ovque0KkiouWKsaeZRxuaKK-ctV_BGdSBZmzcMqug9mrzFxWfJRvAkixSyTn0tUEmT7dCGck8fh8q7rGgC35pYY72h-ixKtxAa5PhS5y8N1ZworXW26";

// Create mock user & community mongoose ids
const mockUser01Id = new Types.ObjectId();
const mockUser02Id = new Types.ObjectId();
const mockUser03Id = new Types.ObjectId();
const mockPost01Id = new Types.ObjectId();
const mockPost02Id = new Types.ObjectId();
const mockPost03Id = new Types.ObjectId();
const mockThread01Id = new Types.ObjectId();
const mockThread02Id = new Types.ObjectId();
const mockBooking01Id = new Types.ObjectId();
const mockRequest01Id = new Types.ObjectId();
const mockRequest02Id = new Types.ObjectId();
const mockCommunity01Id = new Types.ObjectId();
const mockCommunity02Id = new Types.ObjectId();
const mockNotification01Id = new Types.ObjectId();
const mockNotification02Id = new Types.ObjectId();
const mockNotification03Id = new Types.ObjectId();

const mockMessage01Id = new Types.ObjectId();
const mockMessage02Id = new Types.ObjectId();
const mockMessage03Id = new Types.ObjectId();

// Mock message01

export const mockMessage01 = {
  _id: mockMessage01Id,
  text: "Mock message 01 text for chat",
  sender: mockUser01Id,
  notification: mockNotification01Id,
};

export const mockMessage02 = {
  _id: mockMessage02Id,
  text: "Mock message 02 text for booking",
  sender: mockUser01Id,
  notification: mockNotification02Id,
};

export const mockMessage03 = {
  _id: mockMessage03Id,
  text: "Mock message 03 text for request",
  sender: mockUser01Id,
  notification: mockNotification03Id,
};

// Mock notification01
export const mockNotification01 = {
  _id: mockNotification01Id,
  ofType: 0,
  messages: [mockMessage01Id],
  participants: [mockUser01Id, mockUser03Id],
  isRead: {
    [mockUser01Id.toString()]: false,
    [mockUser03Id.toString()]: false,
  },
  community: mockCommunity01Id,
};

// Mock notification02
export const mockNotification02 = {
  _id: mockNotification02Id,
  ofType: 1,
  booking: mockBooking01Id,
  messages: [mockMessage02Id],
  participants: [mockUser01Id, mockUser03Id],
  isRead: {
    [mockUser01Id.toString()]: true,
    [mockUser03Id.toString()]: true,
  },
  community: mockCommunity01Id,
};

export const mockNotification03 = {
  _id: mockNotification03Id,
  ofType: 2,
  post: mockPost03Id,
  messages: [mockMessage03Id],
  participants: [mockUser01Id, mockUser03Id],
  isRead: {
    [mockUser01Id.toString()]: false,
    [mockUser03Id.toString()]: false,
  },
  community: mockCommunity01Id,
};

// Mock user01
export const mockUser01 = {
  _id: mockUser01Id,
  name: "MockUser01",
  email: "mock.user01@email.com",
  password: "1234567",
  apartment: "001",
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
  tokenVersion: 1,
  fcmTokens: [
    fcmToken,
    "dMsiI1VO70YG76TGDW-4Af:APA91bGqGoCM9Fb5dQO3DTbBuxs00L_k4affEvRLljQXvKm10-I9hC52vbhoKURQJr_jZRkGG3BwZaVyqdiHfwbWWqTvaOxbjiEi2A0NQXiprgGrS9NgCOzaRIpmT_-7akNVbUC-4Zq1",
  ],
};

// Mock user02
export const mockUser02 = {
  _id: mockUser02Id,
  name: "MockUser02",
  email: "mock.user02@email.com",
  password: "1234567",
  apartment: "002",
  isNotified: true,
  isCreator: true,
  isMigrated: true,
  isAdmin: false,
  image: JSON.stringify(mockUploadResponse),
  communities: [mockCommunity02Id],
  posts: [],
  requests: [],
  notifications: [],
  tokenVersion: 2,
  fcmTokens: [
    "eaVVtXxlCZnrVcTmw6s1uV:APA91bEr4EHQEnOlRKcqeXL1HbGbg9HH7l1NdQGCxlC3-0JIbVg5z3EoWEMRfn5xSempGurM1U_a3Kf799nUwElNZM_9JEOmWsTkLiZ5MQYjKLbSvMUS9yKjLXJ0byBRV2HuJvR_x42J",
    "emri_JNEXkt4D3ESOv0eBG:APA91bG6FqfeM47Jgsxuyl8wBskbSt_eGykjdAc2SEv4Zo0OdZAbSzAA1LQtIw9AdP3gyiRg8zpV37pFtC_jFk47XMubUI0uRcOahks21H74R0ZpMidgKrNXL-6s7kFboTBk0Yg8xH_-",
  ],
};

// Mock user03
export const mockUser03 = {
  _id: mockUser03Id,
  name: "MockUser03",
  email: "mock.user03@email.com",
  password:
    "pbkdf2_sha256$150000$snZYsk8O7sIu$cjmeydDZt1BGJK2T82tWWhK/cMHCxhex/yazi2TmNL8=",
  apartment: "003",
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
  tokenVersion: 3,
  fcmTokens: [
    "e2KbLgvzp6qr-lNYAZDfFI:APA91bHgYnyDiyrgDaHvioLLiENO__HsuSqnNx4Iu5rM7UpSTvzG6dwOK9iic8P7tcHKJeZaPEjn4rij1SX40UEnbktZPFRmgVHUPEhulsVPpYNwi8iM5VCcylbM44okZYaN8Xa-KTjk",
    "dfG41HAyWWi-4XEJ_1xm49:APA91bFq_Wix0Fg9ARoqiCJvtq8lsjmJrHCnEC8V4EdZ5mR35YG8quF3NYnGBi82x2Z_eNO-qSMyVqBP8XAoM-Ib21TJ3BizP5B6_gnqMUml2My4HJMdIeLTxUOB_0cXnWYqnj4LSHL6",
  ],
};

// Mock community01
export const mockCommunity01 = {
  _id: mockCommunity01Id,
  name: "Mock Community 01",
  code: "mockCommunity01",
  zipCode: "00001",
  creator: mockUser01Id,
  members: [mockUser01Id, mockUser03Id],
  posts: [mockPost01Id, mockPost02Id, mockPost03Id],
  requests: [mockRequest01Id, mockRequest02Id],
};

// Mock community02
export const mockCommunity02 = {
  _id: mockCommunity02Id,
  name: "Mock Community 02",
  code: "mockCommunity02",
  zipCode: "00002",
  creator: mockUser02Id,
  members: [mockUser02Id, mockUser03Id],
  posts: [mockPost01Id],
};

// Mock booking01
export const mockBooking01 = {
  _id: mockBooking01Id,
  post: mockPost01Id,
  status: 0,
  dateType: 0,
  booker: mockUser03Id,
  community: mockCommunity01,
};

// mock thread01
export const mockThread01 = {
  _id: mockThread01Id,
  content: "Comment on post01",
  poster: mockUser03Id,
  community: mockCommunity01Id,
};

// mock thread02
export const mockThread02 = {
  _id: mockThread02Id,
  content: "Comment on request01",
  poster: mockUser03Id,
  community: mockCommunity01Id,
};

// Mock post01
export const mockPost01 = {
  _id: mockPost01Id,
  title: "Mock Post 01",
  desc: "mockPost01",
  image: JSON.stringify(mockUploadResponse),
  condition: 0,
  isGiveaway: true,
  creator: mockUser01Id,
  bookings: [mockBooking01Id],
  threads: [mockThread01Id],
};

// Mock post02
export const mockPost02 = {
  _id: mockPost02Id,
  title: "Mock Post 02",
  desc: "mockPost02",
  image: JSON.stringify(mockUploadResponse),
  condition: 1,
  isGiveaway: false,
  creator: mockUser01Id,
  bookings: [],
  threads: [],
};

// Mock post03
export const mockPost03 = {
  _id: mockPost03Id,
  title: "Mock Post 03",
  desc: "mockPost02 for mockRequest02",
  image: JSON.stringify(mockUploadResponse),
  condition: 2,
  isGiveaway: false,
  creator: mockUser01Id,
  bookings: [],
  threads: [],
};

// Mock request01
export const mockRequest01 = {
  _id: mockRequest01Id,
  title: "Mock Request 01",
  desc: "mockRequest01",
  dateType: 2,
  dateNeed: new Date(),
  dateReturn: new Date(),
  image: JSON.stringify(mockUploadResponse),
  creator: mockUser01Id,
  threads: [mockThread02Id],
};

// Mock request02
export const mockRequest02 = {
  _id: mockRequest02Id,
  title: "Mock Request 02",
  desc: "mockRequest02",
  dateType: 2,
  dateNeed: new Date(),
  dateReturn: new Date(),
  image: JSON.stringify(mockUploadResponse),
  creator: mockUser03Id,
};

export default async function createInitData() {
  try {
    // Hash password for mock user 01 & mock user 02
    const [mockUser01PasswordHash, mockUser02PasswordHash] = await Promise.all([
      bcryptjs.hash(mockUser01.password, 12),
      bcryptjs.hash(mockUser02.password, 12),
    ]);

    // Write initial data to database
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
