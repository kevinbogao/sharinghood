import { Document, Schema, Types, model } from "mongoose";
import { PostDocument } from "./post";
import { UserDocument } from "./user";
import { RequestDocument } from "./request";

export interface Community {
  name: string;
  code: string;
  zipCode: string;
  password?: string;
  creator: Types.ObjectId | UserDocument;
  members: Array<Types.ObjectId | UserDocument>;
  posts: Array<Types.ObjectId | PostDocument>;
  requests: Array<Types.ObjectId | RequestDocument>;
}

export interface CommunityDocument extends Community, Document {}

const communitySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
  },
  { timestamps: true }
);

// Create index for community code
communitySchema.index({ code: 1 });

export default model<CommunityDocument>("Community", communitySchema);
