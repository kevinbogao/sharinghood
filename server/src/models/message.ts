import { Schema, model } from "mongoose";
import { IMessage } from "../types/models";

const messageSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notification: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
    },
  },
  { timestamps: true }
);

export default model<IMessage>("Message", messageSchema);
