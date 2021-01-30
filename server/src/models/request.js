const { Schema, model } = require("mongoose");

const requestSchema = new Schema(
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

module.exports = model("Request", requestSchema);
