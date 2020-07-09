const { Schema, model } = require('mongoose');

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Requests',
      },
    ],
  },
  { timestamps: true }
);

// Create index for community code
communitySchema.index({ code: 1 });

module.exports = model('Community', communitySchema);
