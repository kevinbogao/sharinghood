const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    type: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    on: {
      type: Schema.Types.ObjectId,
      refPath: 'onModel',
    },
    onModel: {
      type: String,
      required: true,
    },
    recipient: {
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
