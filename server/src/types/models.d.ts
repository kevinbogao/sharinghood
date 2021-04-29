import { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  post: Schema.Types.ObjectId | IPost;
  status: number;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  booker?: Schema.Types.ObjectId | IUser;
  community?: Schema.Types.ObjectId | ICommunity;
}

export interface ICommunity extends Document {
  name: string;
  code: string;
  zipCode: string;
  password?: string;
  creator: Schema.Types.ObjectId | IUser;
  members?: Array<Schema.Types.ObjectId | IUser>;
  posts?: Array<Schema.Types.ObjectId | IPost>;
  requests?: Array<Schema.Types.ObjectId>;
}

export interface IMessage extends Document {
  text: string;
  sender: Schema.Types.ObjectId | IUser;
  notification: Schema.Types.ObjectId | INotification;
}

export interface INotification extends Document {
  ofType: number;
  booking?: Schema.Types.ObjectId | IBooking;
  post?: Schema.Types.ObjectId | IPost;
  messages?: Array<Schema.Types.ObjectId | IMessage>;
  participants: Array<Schema.Types.ObjectId | IMessage>;
  isRead: {
    [userId: string]: boolean;
  };
  community: Schema.Types.ObjectId | ICommunity;
}

export interface IPost extends Document {
  title: string;
  desc: string;
  condition: string;
  image: string;
  isGiveaway: boolean;
  creator: Schema.Types.ObjectId | IUser;
  bookings?: Array<Schema.Types.ObjectId | IBooking>;
  threads?: Array<Schema.Types.ObjectId | IThread>;
}

export interface IRequest extends Document {
  title: string;
  desc: string;
  image: string;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  creator: Schema.Types.ObjectId | IUser;
  threads?: Array<Schema.Types.ObjectId | IThread>;
}

export interface IThread extends Document {
  content: string;
  poster: Schema.Types.ObjectId | IUser;
  community: Schema.Types.ObjectId | IUser;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image: string;
  desc?: string;
  apartment?: string;
  posts?: Array<Schema.Types.ObjectId | IPost>;
  requests?: Array<Schema.Types.ObjectId | IRequest>;
  communities: Array<Schema.Types.ObjectId | ICommunity>;
  lastLogin: Date;
  isNotified: boolean;
  isAdmin: boolean;
  isMigrated: boolean;
  tokenVersion: number;
  fcmTokens: Array<String>;
}
