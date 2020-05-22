const { Schema, model } = require('mongoose');

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
  },
  { timestamps: true }
);

module.exports = model('Chat', chatSchema);
