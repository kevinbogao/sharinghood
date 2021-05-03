import { Document, Schema, Types, model } from "mongoose";
import { PostDocument } from "./post";
import { RequestDocument } from "./request";
import { CommunityDocument } from "./community";
import { NotificationDocument } from "./notification";

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  image: string;
  desc?: string;
  apartment?: string;
  lastLogin?: Date;
  isNotified: boolean;
  isAdmin: boolean;
  isMigrated: boolean;
  tokenVersion: number;
  fcmTokens: Array<string>;
  posts: Array<Types.ObjectId | PostDocument>;
  requests: Array<Types.ObjectId | RequestDocument>;
  communities: Array<Types.ObjectId | CommunityDocument>;
  notifications: Array<Types.ObjectId | NotificationDocument>;
}

export interface UserDocument extends Omit<User, "_id">, Document {}

// Limit number of communities a user can be in to 5
function communitiesLimit(communities: any): boolean {
  return communities.length < 6;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    desc: String,
    apartment: String,
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Requests",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    communities: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Community",
        },
      ],
      validate: [communitiesLimit, "{PATH} exceeds the limit of 5"],
    },
    lastLogin: Date,
    isNotified: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMigrated: {
      type: Boolean,
      required: true,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    fcmTokens: [String],
  },
  { timestamps: true }
);

// Index for user email
userSchema.index({ email: 1 });

export default model<UserDocument>("User", userSchema);
