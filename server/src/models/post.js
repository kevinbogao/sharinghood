const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    title: {
      type: String,
      // required: true,
      unique: true,
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
      ref: 'User',
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    threads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Post', postSchema);
