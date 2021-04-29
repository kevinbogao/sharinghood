import { Document, Schema, model } from "mongoose";

interface ICommunity extends Document {
  name: string;
  code: string;
  zipCode: string;
  password: string;
  creator: Schema.Types.ObjectId;
  members: Array<Schema.Types.ObjectId>;
  posts: Array<Schema.Types.ObjectId>;
  requests: Array<Schema.Types.ObjectId>;
}

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

export default model<ICommunity>("Community", communitySchema);
