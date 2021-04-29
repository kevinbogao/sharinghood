import { Schema, model } from "mongoose";
import { IThread } from "../types/models";

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
