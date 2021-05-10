import { AuthenticationError } from "apollo-server-koa";
import User, { UserDocument } from "../models/user";
import Post, { PostDocument } from "../models/post";
import Booking, { BookingDocument } from "../models/booking";
import Notification, { NotificationDocument } from "../models/notification";
import { UserTokenContext } from "../utils/authToken";
import pushNotification from "../utils/pushNotification";
import updateBookingMail from "../utils/sendMail/updateBookingMail";

export interface BookingInput {
  postId: string;
  bookingId: string;
  communityId: string;
  notificationId: string;
  status: number;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  notifyContent: string;
  notifyRecipientId: string;
}

const bookingsResolvers = {
  Mutation: {
    updateBooking: async (
      _: unknown,
      {
        bookingInput: {
          status,
          bookingId,
          communityId,
          notificationId,
          notifyContent,
          notifyRecipientId,
        },
      }: { bookingInput: BookingInput },
      { user, redis }: { user: UserTokenContext; redis: any }
    ): Promise<BookingDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find booking, notification & recipient by id
        const booking: BookingDocument | null = await Booking.findById(
          bookingId
        ).populate("post");
        if (!booking) throw new Error("Booking not found");

        const notification: NotificationDocument | null =
          await Notification.findById(notificationId);
        if (!notification) throw new Error("Notification not found");

        const recipient: UserDocument | null = await User.findById(
          notifyRecipientId
        ).lean();
        if (!recipient) throw new Error("Recipient not found");

        // Get post & check if current user is post creator
        // && throw error if not
        const post: PostDocument | null = await Post.findById(
          booking.post
        ).lean();
        if (!post) throw new Error("Post not found");

        if (post.creator.toString() !== user.userId.toString()) {
          throw new Error("Unauthorized user");
        }

        // Update booking status
        booking.status = status;

        // Set recipient's notification isRead status to false
        notification.isRead[notifyRecipientId] = false;
        notification.markModified("isRead");

        // Save booking & send booking notification email if user is notified
        await Promise.all([
          booking.save(),
          notification.save(),
          process.env.NODE_ENV === "production" &&
            recipient.isNotified &&
            updateBookingMail({
              bookingsUrl: `${process.env.ORIGIN}/notifications`,
              to: recipient.email,
              subject: notifyContent,
            }),
          // Set communityId key to notifications:userId hash in redis
          redis.hset(
            `notifications:${notifyRecipientId}`,
            `${communityId}`,
            true
          ),
        ]);

        // Send push notification to requester
        pushNotification(
          { communityId },
          `${user.userName} ${
            status === 1 ? "accepted" : "denied"
          } your booking on ${post.title}`,
          [
            {
              _id: recipient._id,
              fcmTokens: recipient.fcmTokens,
            },
          ]
        );

        return booking;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default bookingsResolvers;
