const { Schema, model } = require('mongoose');

const postSchema = new Schema(
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
      ref: 'User',
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
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Post', postSchema);
