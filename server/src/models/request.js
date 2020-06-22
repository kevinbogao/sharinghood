const { Schema, model } = require('mongoose');

const requestSchema = new Schema(
  {
    title: {
      type: String,
      // unique: true,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    dateNeed: {
      type: Date,
      required: true,
    },
    dateReturn: {
      type: Date,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
    threads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Request', requestSchema);
