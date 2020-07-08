const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    // 0: Chats
    // 1: Bookings
    // 2: Requests
    ofType: {
      type: Number,
      required: true,
    },

    // For ofType 1
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // For ofType 2
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
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

    // Notification community
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
  },
  { timestamps: true }
);

// Compound index for ofType, participants & community
notificationSchema.index({ ofType: 1, participants: 1, community: 1 });

// Secondary index for community
notificationSchema.index({ community: 1 });

module.exports = model('Notification', notificationSchema);
