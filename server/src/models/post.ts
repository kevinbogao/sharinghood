import { Schema, model } from "mongoose";
import { IPost } from "../types/models";

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

export default model<IPost>("Post", postSchema);
