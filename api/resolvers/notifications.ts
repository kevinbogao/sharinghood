import {
  UserInputError,
  AuthenticationError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import bookingResolvers from "./bookings";
import { Notification } from "../entities";
import sendMail from "../../lib/mail";
import pushNotification from "../../lib/firebase";
import { NotificationType } from "../../lib/enums";
import type {
  Context,
  NotificationsVars,
  CreateNotificationInput,
} from "../../lib/types";

const notificationResolvers = {
  Query: {
    async notification(
      _: never,
      { notificationId }: { notificationId: string },
      { user, connection, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Notification> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const notification = await loader
        .loadEntity(Notification, "notification")
        .where("notification.id = :notificationId", { notificationId })
        .info(info)
        .loadOne();

      if (!notification) throw new UserInputError("Notification not found");
      if (notification.notifier?.id === user.userId)
        notification.notifier = null;

      return await connection.manager.save(notification);
    },
    async findNotification(
      _: never,
      {
        recipientId,
        communityId,
      }: { recipientId: string; communityId: string },
      { user, connection }: Context
    ): Promise<Notification | undefined> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const notification = await connection
        .getRepository(Notification)
        .findOne({
          where: [
            {
              type: NotificationType.CHAT,
              recipientId: recipientId,
              creatorId: user.userId,
              communityId,
            },
            {
              type: NotificationType.CHAT,
              recipientId: user.userId,
              creatorId: recipientId,
              communityId,
            },
          ],
          select: ["id"],
        });

      return notification;
    },
    //     async notifications(
    //       _: never,
    //       { offset, limit, communityId }: NotificationsVars,
    //       { user, redis, loader }: Context,
    //       info: IGraphQLToolsResolveInfo
    //     ): Promise<Notification[]> {
    //       if (!user) throw new AuthenticationError("Not Authenticated");

    //       const [notifications] = await loader
    //         .loadEntity(Notification, "notification")
    //         .info(info)
    //         .ejectQueryBuilder((qb) =>
    //           qb
    //             .where("notification.communityId = :communityId", {
    //               communityId,
    //             })
    //             .andWhere(
    //               "notification.creatorId = :userId OR notification.recipientId = :userId",
    //               {
    //                 userId: user.userId,
    //               }
    //             )
    //         )
    //         .order({ "notification.updatedAt": "DESC" })
    //         .paginate({ offset, limit })
    //         .loadPaginated();

    //       await redis.hdel(`notifications:${user.userId}`, `${communityId}`);

    //       return notifications;
    //     },
    async paginatedNotifications(
      _: never,
      { offset, limit, communityId }: NotificationsVars,
      { user, redis, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<{ notifications: Notification[]; hasMore: boolean }> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [notifications, totalCount] = await loader
        .loadEntity(Notification, "notification")
        .info(info, "notifications")
        .ejectQueryBuilder((qb) =>
          qb
            .where("notification.communityId = :communityId", { communityId })
            .andWhere(
              "notification.creatorId = :userId OR notification.recipientId = :userId",
              { userId: user.userId }
            )
        )
        .order({ "notification.updatedAt": "DESC" })
        .paginate({ offset, limit })
        .loadPaginated();

      await redis.hdel(`notifications:${user.userId}`, `${communityId}`);

      return { notifications, hasMore: offset + limit < totalCount };
    },
  },
  Mutation: {
    async createNotification(
      _: unknown,
      {
        notificationInput: {
          type,
          postId,
          recipientId,
          communityId,
          bookingInput,
        },
      }: { notificationInput: CreateNotificationInput },
      ctx: Context
    ): Promise<Notification> {
      const { user, redis, connection } = ctx;
      if (!user) throw new AuthenticationError("Not Authenticated");

      const notificationCount = await redis.hget(
        `notifications:${recipientId}`,
        communityId
      );

      const notification = new Notification();
      notification.type = type;
      notification.creatorId = user.userId;
      notification.recipientId = recipientId;
      notification.communityId = communityId;
      notification.notifierId = recipientId;

      if (type === NotificationType.REQUEST && postId)
        notification.postId = postId;
      else if (type === NotificationType.BOOKING && bookingInput) {
        const booking = await bookingResolvers.Mutation.createBooking(
          undefined,
          { bookingInput },
          ctx
        );
        notification.booking = booking;

        const subject = `${user.userName} has requested to book your ${booking.post.title}`;
        sendMail(
          "updateBooking",
          {
            notificationUrl: `${process.env.ORIGIN}/notifications/${notification.id}`,
            subject,
            recipientId: booking.post.creator.id,
            unsubscribeToken: booking.post.creator.unsubscribeToken,
          },
          { to: booking.post.creator.email, subject }
        );
        pushNotification({ communityId }, subject, [booking.post.creator]);
      }

      const [newNotification] = await Promise.all([
        connection.manager.save(notification),
        redis.hset(
          `notifications:${recipientId}`,
          new Map([[`${communityId}`, +notificationCount! + 1]])
        ),
      ]);

      return newNotification;
    },
  },
};

export default notificationResolvers;
