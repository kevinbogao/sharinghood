import { Document, Schema, Types, model } from "mongoose";
import { UserDocument } from "./user";
import { NotificationDocument } from "./notification";

export interface Message {
  text: string;
  sender: Types.ObjectId | UserDocument;
  notification: Types.ObjectId | NotificationDocument;
}

export interface MessageDocument extends Message, Document {}

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

export default model<MessageDocument>("Message", messageSchema);
