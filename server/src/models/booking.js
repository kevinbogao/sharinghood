const { Schema, model } = require('mongoose');

const bookingSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
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
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = model('Booking', bookingSchema);
