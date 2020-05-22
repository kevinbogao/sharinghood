const { Schema, model } = require('mongoose');

const bookingSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    booker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dateNeed: {
      type: Date,
      required: true,
    },
    dateReturn: {
      type: Date,
      required: true,
    },
    pickupTime: Date,
    status: {
      type: Number,
      required: true,
    },
    patcher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = model('Booking', bookingSchema);
