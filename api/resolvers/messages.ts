import { UserInputError, AuthenticationError } from "apollo-server-micro";
import { withFilter } from "graphql-subscriptions";
import { User, Message, Notification } from "../entities";
import { pubsub } from "../../lib/redis";
import pushNotification from "../../lib/firebase";
import type { Context, CreateMessageInput } from "../../lib/types";

const NOTIFICATION_MESSAGE = "NOTIFICATION_MESSAGE";

interface MessageSubscriptionArgs {
  notificationId: string;
}

interface MessageSubscriptionPayload {
  notificationId: string;
  notificationMessage: Message;
}

const messageResolvers = {
  Subscription: {
    notificationMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NOTIFICATION_MESSAGE),
        (payload: MessageSubscriptionPayload, args: MessageSubscriptionArgs) =>
          payload.notificationId === args.notificationId
      ),
    },
  },
  Mutation: {
    async createMessage(
      _: never,
      {
        messageInput: { content, communityId, recipientId, notificationId },
      }: { messageInput: CreateMessageInput },
      { user, connection, redis }: Context
    ): Promise<Message> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [creator, recipient, notification, notificationCount] =
        await Promise.all([
          connection
            .getRepository(User)
            .findOne({ where: { id: user.userId }, select: ["id"] }),
          connection
            .getRepository(User)
            .createQueryBuilder("user")
            .leftJoin("user.tokens", "token")
            .select(["user.id", "token.firebase"])
            .getOne(),
          connection
            .getRepository(Notification)
            .findOne({ where: { id: notificationId }, select: ["id"] }),
          redis.hget(`notifications:${recipientId}`, `${communityId}`),
        ]);
      if (!creator) throw new AuthenticationError("Not Authenticated");
      if (!recipient) throw new UserInputError("Recipient not found");
      if (!notification) throw new UserInputError("Notification not found");

      const message = new Message();
      message.content = content;
      message.creator = creator;
      message.notification = notification;

      notification.notifierId = recipientId;

      const [newMessage] = await Promise.all([
        connection.manager.save(message),
        connection.manager.save(notification),
        await redis.hset(
          `notifications:${recipientId}`,
          new Map([[`${communityId}`, +notificationCount! + 1]])
        ),
      ]);

      pubsub.publish(NOTIFICATION_MESSAGE, {
        notificationId,
        notificationMessage: {
          id: newMessage.id,
          content: newMessage.id,
          creator: { id: newMessage.creatorId },
          createdAt: newMessage.createdAt,
        },
      });

      pushNotification({ communityId }, `${user.userName}: ${content}`, [
        recipient,
      ]);

      return newMessage;
    },
  },
};

export default messageResolvers;
