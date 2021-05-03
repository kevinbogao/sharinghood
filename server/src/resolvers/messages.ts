import { withFilter, AuthenticationError } from "apollo-server";
import pubsub from "../utils/pubsub";
import User, { UserDocument } from "../models/user";
import Message, { MessageDocument } from "../models/message";
import Notification, { NotificationDocument } from "../models/notification";
import { UserTokenContext } from "../utils/authToken";
import pushNotification from "../utils/pushNotification";

interface MessageInput {
  text: string;
  recipientId: string;
  communityId: string;
  notificationId: string;
}

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
      _: unknown,
      {
        messageInput: { text, communityId, recipientId, notificationId },
      }: { messageInput: MessageInput },
      { user, redis }: { user: UserTokenContext; redis: any }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId } = user;

      try {
        // Create and save message && get notification & recipient
        const message: MessageDocument = await Message.create({
          text,
          sender: userId,
          notification: notificationId,
        });
        const notification: NotificationDocument | null = await Notification.findById(
          notificationId
        );
        const recipient: UserDocument | null = await User.findById(
          recipientId
        ).lean();

        if (notification && recipient) {
          // Add message id to notification & update recipient's isRead status to false
          notification.messages.push(message);
          notification.isRead[recipientId.toString()] = false;
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
              // @ts-ignore
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
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default messagesResolvers;
