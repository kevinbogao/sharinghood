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
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
  },
  { timestamps: true }
);

module.exports = model('Message', messageSchema);
