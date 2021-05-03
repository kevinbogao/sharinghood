import { AuthenticationError } from "apollo-server";
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
    ): Promise<BookingDocument | null> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find booking, notification & recipient by id
        const booking: BookingDocument | null = await Booking.findById(
          bookingId
        ).populate("post");
        const notification: NotificationDocument | null = await Notification.findById(
          notificationId
        );
        const recipient: UserDocument | null = await User.findById(
          notifyRecipientId
        ).lean();

        if (booking && notification && recipient) {
          // Get post & check if current user is post creator
          // && throw error if not

          const post: PostDocument | null = await Post.findById(
            booking.post
          ).lean();

          if (post) {
            if (post.creator.toString() !== user.userId) {
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
                updateBookingMail(
                  `${process.env.ORIGIN}/notifications`,
                  recipient.email,
                  notifyContent
                ),
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
          }
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default bookingsResolvers;
