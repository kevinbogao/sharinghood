const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notification: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    },
  },
  { timestamps: true }
);

module.exports = model('Message', messageSchema);
