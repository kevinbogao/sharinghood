const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    // 0: bookings
    // 1: requests
    // 2: chats
    onType: {
      type: Number,
      required: true,
    },

    // onDocId: {
    //   type: Schema.Types.ObjectId,
    //   required: true,
    // },
    content: {
      type: String,
      // required: true,
    },

    // Booking obj if type is 0
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // Booking obj if type is 1
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
    },

    // All messages associated with booking or chat
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // User participated in the notification model
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Notification', notificationSchema);
