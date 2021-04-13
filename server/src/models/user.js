const { Schema, model } = require("mongoose");

// Limit number of communities a user can be in to 5
function communitiesLimit(communities) {
  return communities.length < 6;
}

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
    image: {
      type: String,
      required: true,
    },
    desc: String,
    apartment: String,
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Requests",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    communities: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Community",
        },
      ],
      validate: [communitiesLimit, "{PATH} exceeds the limit of 5"],
    },
    lastLogin: Date,
    isNotified: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMigrated: {
      type: Boolean,
      required: true,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    fcmTokens: [String],
  },
  { timestamps: true }
);

// Index for user email
userSchema.index({ email: 1 });

module.exports = model("User", userSchema);
