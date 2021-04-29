// @ts-nocheck
import AuthenticationError from "apollo-server";
import User from "../models/user";
import Post from "../models/post";
import Booking from "../models/booking";
import Notification from "../models/notification";

const updateBookingMail = require("../utils/sendMail/updateBookingMail");
const pushNotification = require("../utils/pushNotification");

const bookingsResolvers = {
  Mutation: {
    updateBooking: async (
      _,
      {
        bookingInput: {
          status,
          bookingId,
          communityId,
          notificationId,
          notifyContent,
          notifyRecipientId,
        },
      },
      { user, redis }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find booking, notification & recipient by id
        const [booking, notification, recipient] = await Promise.all([
          Booking.findById(bookingId).populate("post"),
          Notification.findById(notificationId),
          User.findById(notifyRecipientId).lean(),
        ]);

        // Get post & check if current user is post creator
        // && throw error if not
        const post = await Post.findById(booking.post).lean();
        if (!post.creator.equals(user.userId)) {
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
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default bookingsResolvers;
