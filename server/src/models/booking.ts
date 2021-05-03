import { Document, Schema, Types, model } from "mongoose";
import { PostDocument } from "./post";
import { UserDocument } from "./user";
import { CommunityDocument } from "./community";

interface Booking {
  _id: Types.ObjectId;
  status: number;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  post: Types.ObjectId | PostDocument;
  booker: Types.ObjectId | UserDocument;
  community: Types.ObjectId | CommunityDocument;
}

export interface BookingDocument extends Omit<Booking, "_id">, Document {}

const bookingSchema: Schema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    // 0: pending
    // 1: accepted
    // 2: declined
    status: {
      type: Number,
      required: true,
    },

    // 0: asap
    // 1: any
    // 2: need & return
    dateType: {
      type: Number,
      required: true,
    },

    // dateNeed & dateReturn are not needed for
    // date type 0 & 1
    dateNeed: Date,
    dateReturn: Date,

    // User who booked the post
    booker: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Which community is the booking part of
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  },
  { timestamps: true }
);

// Index for booking community
bookingSchema.index({ community: 1 });

export default model<BookingDocument>("Booking", bookingSchema);
