import {
  UserInputError,
  AuthenticationError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import bookingResolvers from "./bookings";
import { Booking, Notification } from "../entities";
import sendMail from "../../lib/mail";
import pushNotification from "../../lib/firebase";
import {
  Context,
  NotificationType,
  CreateNotificationInput,
} from "../../lib/types";

const notificationResolvers = {
  Query: {
    async notification(
      _: unknown,
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
      if (notification.notifierId === user.userId)
        notification.notifierId = null;

      return await connection.manager.save(notification);
    },
    async findNotification(
      _: unknown,
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
    async notifications(
      _: unknown,
      { communityId }: { communityId: string },
      { user, redis, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Notification[]> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [notifications] = await Promise.all([
        loader
          .loadEntity(Notification, "notification")
          .info(info)
          .ejectQueryBuilder((qb) =>
            qb
              .where("notification.communityId = :communityId", {
                communityId,
              })
              .andWhere(
                "notification.creatorId = :userId OR notification.recipientId = :userId",
                {
                  userId: user.userId,
                }
              )
          )
          .order({ "notification.updatedAt": "DESC" })
          .loadMany(),
        redis.hdel(`notifications:${user.userId}`, `${communityId}`),
      ]);

      return notifications;
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
      { user, connection }: Context
    ): Promise<Notification> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const notification = new Notification();
      notification.type = type;
      notification.creatorId = user.userId;
      notification.recipientId = recipientId;
      notification.communityId = communityId;
      notification.notifierId = recipientId;

      let booking: Booking | undefined;
      if (type === NotificationType.BOOKING && bookingInput) {
        booking = await bookingResolvers.Mutation.createBooking(
          {},
          { ...bookingInput },
          // @ts-ignore
          { user, connection }
        );
        notification.booking = booking;
      } else if (type === NotificationType.REQUEST && postId) {
        notification.postId = postId;
      }

      const newNotification = await connection.manager.save(notification);

      if (type === NotificationType.BOOKING && booking) {
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

      return newNotification;
    },
  },
};

export default notificationResolvers;
