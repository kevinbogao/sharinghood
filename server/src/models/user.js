const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    apartment: {
      type: String,
      required: true,
    },
    createdPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    createdRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Requests',
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
      },
    ],
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
    isNotified: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isCreator: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
