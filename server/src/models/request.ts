import { Document, Schema, Types, model } from "mongoose";
import { UserDocument } from "./user";
import { ThreadDocument } from "./thread";

interface RequestBaseDocument {
  title: string;
  desc: string;
  image: string;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  creator: Types.ObjectId | UserDocument;
  threads: Array<Types.ObjectId | ThreadDocument>;
}

export interface RequestDocument extends RequestBaseDocument, Document {}

const requestSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    image: {
      type: String,
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

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    threads: [
      {
        type: Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
  },
  { timestamps: true }
);

export default model<RequestDocument>("Request", requestSchema);
