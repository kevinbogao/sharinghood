const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    // 0: chats
    // 1: bookings
    // 2: requests
    ofType: {
      type: Number,
      required: true,
    },

    // Booking obj if type is 0
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // Request response obj if type is 1
    requestRes: {
      post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
      request: {
        type: Schema.Types.ObjectId,
        ref: 'Request',
      },
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

    // Notification read status
    isRead: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Index for user email
notificationSchema.index({ ofType: 1, participants: 1 });

module.exports = model('Notification', notificationSchema);
