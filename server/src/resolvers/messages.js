const { withFilter, AuthenticationError } = require("apollo-server");
const pubsub = require("../utils/pubsub");
const User = require("../models/user");
const Message = require("../models/message");
const Notification = require("../models/notification");
const pushNotification = require("../utils/pushNotification");

const NEW_NOTIFICATION_MESSAGE = "NEW_NOTIFICATION_MESSAGE";

const messagesResolvers = {
  Subscription: {
    newNotificationMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_NOTIFICATION_MESSAGE),
        (payload, args) => payload.notificationId === args.notificationId
      ),
    },
  },
  Mutation: {
    createMessage: async (
      _,
      { messageInput: { text, communityId, recipientId, notificationId } },
      { user, redis }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId } = user;

      try {
        // Create and save message && get notification & recipient
        const [message, notification, recipient] = await Promise.all([
          Message.create({
            text,
            sender: userId,
            notification: notificationId,
          }),
          Notification.findById(notificationId),
          User.findById(recipientId).lean(),
        ]);

        // Add message id to notification & update recipient's isRead status to false
        notification.messages.push(message);
        notification.isRead[recipientId] = false;
        notification.markModified("isRead");

        // Save notification & set communityId key to recipient's notifications:userId hash in redis
        await Promise.all([
          notification.save(),
          redis.hset(
            `notifications:${recipientId}`,
            `${notification.community}`,
            true
          ),
        ]);

        // Publish new message
        pubsub.publish(NEW_NOTIFICATION_MESSAGE, {
          notificationId,
          newNotificationMessage: {
            _id: message._id,
            text: message.text,
            sender: {
              _id: userId,
            },
            createdAt: message.createdAt,
          },
        });

        // Sent push notification
        pushNotification(
          {
            communityId,
            recipientId,
          },
          `${user.userName}: ${text}`,
          [
            {
              _id: recipient._id,
              fcmTokens: recipient.fcmTokens,
            },
          ]
        );

        return message;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = messagesResolvers;
