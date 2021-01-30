const { Schema, model } = require("mongoose");

const threadSchema = new Schema(
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

module.exports = model("Thread", threadSchema);
