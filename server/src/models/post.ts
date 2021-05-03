import { Document, Schema, Types, model } from "mongoose";
import { UserDocument } from "./user";
import { ThreadDocument } from "./thread";
import { BookingDocument } from "./booking";

interface PostBaseDocument {
  title: string;
  desc: string;
  condition: number;
  image: string;
  isGiveaway: boolean;
  creator: Types.ObjectId | UserDocument;
  threads: Array<Types.ObjectId | ThreadDocument>;
  bookings: Array<Types.ObjectId | BookingDocument>;
}

export interface PostDocument extends PostBaseDocument, Document {}

const postSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    condition: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    isGiveaway: {
      type: Boolean,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    threads: [
      {
        type: Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
  },
  { timestamps: true }
);

export default model<PostDocument>("Post", postSchema);
