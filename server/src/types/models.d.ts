import { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  post: Schema.Types.ObjectId;
  status: number;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  booker: Schema.Types.ObjectId;
  community: Schema.Types.ObjectId;
}
