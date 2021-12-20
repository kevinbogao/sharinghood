import { UserInputError, AuthenticationError } from "apollo-server-micro";
import { User, Post, Booking, Notification } from "../entities";
import sendMail from "../../lib/mail";
import pushNotification from "../../lib/firebase";
import {
  Context,
  TimeFrame,
  BookingStatus,
  CreateBookingInput,
  BookingInput,
} from "../../lib/types";

const bookingResolvers = {
  Mutation: {
    async createBooking(
      _: unknown,
      {
        postId,
        communityId,
        status,
        timeFrame,
        dateNeed,
        dateReturn,
      }: CreateBookingInput,
      { user, connection }: Context
    ): Promise<Booking> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [booker, post] = await Promise.all([
        connection
          .getRepository(User)
          .findOne({ where: { id: user.userId }, select: ["id"] }),
        connection.getRepository(Post).findOne({
          where: { id: postId },
          relations: ["creator", "creator.tokens"],
        }),
      ]);
      if (!booker) throw new UserInputError("User not found");
      if (!post) throw new UserInputError("Post not found");

      return await Booking.create({
        status,
        timeFrame,
        post,
        booker,
        communityId,
        ...(timeFrame === TimeFrame.SPECIFIC && { dateNeed, dateReturn }),
      }).save();
    },
    async updateBooking(
      _: unknown,
      {
        bookingInput: { status, bookingId, communityId, notificationId },
      }: { bookingInput: BookingInput },
      { user, connection, redis }: Context
    ): Promise<Booking> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [booking, notification] = await Promise.all([
        connection.getRepository(Booking).findOne({
          where: { id: bookingId },
          relations: ["post", "post.creator", "booker", "booker.tokens"],
        }),
        connection
          .getRepository(Notification)
          .findOne({
            where: { id: notificationId },
            select: ["id", "notifierId"],
          }),
      ]);

      if (!booking) throw new UserInputError("Booking not found");
      if (!notification) throw new UserInputError("Notification not found");

      booking.status = status;
      notification.notifierId = booking.booker.id;

      const [updateBooking, notificationCount] = await Promise.all([
        connection.manager.save(booking),
        redis.hget(`notifications:${booking.bookerId}`, `${communityId}`),
        connection.manager.save(notification),
      ]);

      const incrementedCount = notificationCount
        ? Number(notificationCount) + 1
        : 1;

      await redis.hset(
        `notifications:${booking.bookerId}`,
        new Map([[`${communityId}`, incrementedCount]])
      );

      const subject = `${booking.post.creator.name} has ${
        status === BookingStatus.ACCEPTED ? "accepted" : "denied"
      } your booking on ${booking.post.title}`;

      sendMail(
        "updateBooking",
        {
          notificationUrl: `${process.env.ORIGIN}/notifications/id`,
          subject,
          recipientId: booking.booker.id,
          unsubscribeToken: booking.booker.unsubscribeToken,
        },
        { to: booking.booker.email, subject }
      );
      pushNotification({ communityId }, subject, [booking.booker]);

      return updateBooking;
    },
  },
};

export default bookingResolvers;
