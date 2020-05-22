const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    onType: {
      type: Number,
      required: true,
    },
    onDocId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model('Notification', notificationSchema);
