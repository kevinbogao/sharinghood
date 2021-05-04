import { Document, Schema, Types, model } from "mongoose";
import { UserDocument } from "./user";
import { CommunityDocument } from "./community";

interface ThreadBaseDocument {
  content: string;
  poster: Types.ObjectId | UserDocument;
  community: Types.ObjectId | CommunityDocument;
}

export interface ThreadDocument extends ThreadBaseDocument, Document {}

const threadSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    poster: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  },
  { timestamps: true }
);

export default model<ThreadDocument>("Thread", threadSchema);
