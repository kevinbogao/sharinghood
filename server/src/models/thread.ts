import { Document, Schema, model } from "mongoose";

interface IThread extends Document {
  content: string;
  poster: Schema.Types.ObjectId;
  community: Schema.Types.ObjectId;
}

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

export default model<IThread>("Thread", threadSchema);
