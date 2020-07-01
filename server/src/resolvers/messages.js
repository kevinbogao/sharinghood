const { withFilter, AuthenticationError } = require('apollo-server');
const pubsub = require('../utils/pubsub');
const Message = require('../models/message');
const Notification = require('../models/notification');

const NEW_NOTIFICATION_MESSAGE = 'NEW_NOTIFICATION_MESSAGE';

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
      { messageInput: { notificationId, text } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Create and save message & get notification
        const [message, notification] = await Promise.all([
          Message.create({
            text,
            sender: userId,
            notification: notificationId,
          }),
          Notification.findById(notificationId),
        ]);

        // Save messageId to notification
        notification.messages.push(message);
        await notification.save();

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

        return message;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = messagesResolvers;
