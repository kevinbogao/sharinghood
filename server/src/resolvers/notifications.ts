import { ApolloError, AuthenticationError } from "apollo-server-koa";
import { Redis } from "ioredis";
import { Types } from "mongoose";
import User, { UserDocument } from "../models/user";
import Post, { PostDocument } from "../models/post";
import Booking, { BookingDocument } from "../models/booking";
import Notification, { NotificationDocument } from "../models/notification";
import { BookingInput } from "./bookings";
import { UserTokenContext } from "../utils/authToken";
import pushNotification from "../utils/pushNotification";
import updateBookingMail from "../utils/sendMail/updateBookingMail";

interface NotificationInput {
  ofType: number;
  recipientId: string;
  communityId: string;
  bookingInput?: BookingInput;
}

const notificationsResolvers = {
  Query: {
    notification: async (
      _: unknown,
      { notificationId }: { notificationId: string },
      { user }: { user: UserTokenContext }
    ): Promise<NotificationDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get notification & populate data && get notification mongoose instance
        const notification: Array<NotificationDocument> = await Notification.aggregate(
          [
            {
              $match: { _id: Types.ObjectId(notificationId) },
            },
            {
              $lookup: {
                from: "bookings",
                let: { booking: "$booking" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$booking"] } } },
                  {
                    $lookup: {
                      from: "posts",
                      localField: "post",
                      foreignField: "_id",
                      as: "post",
                    },
                  },
                  { $unwind: "$post" },
                ],
                as: "booking",
              },
            },
            {
              $unwind: {
                path: "$booking",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                let: { participants: "$participants" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $in: ["$_id", "$$participants"],
                          },
                          {
                            $ne: ["$_id", Types.ObjectId(user.userId)],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "participants",
              },
            },
            {
              $lookup: {
                from: "messages",
                localField: "messages",
                foreignField: "_id",
                as: "messages",
              },
            },
          ]
        );

        // Update isRead of current user to true via MongoDB API to
        // avoid mongoose's auto timestamp
        await Notification.collection.findOneAndUpdate(
          { _id: Types.ObjectId(notificationId) },
          { $set: { [`isRead.${user.userId}`]: true } }
        );

        return notification[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    notifications: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user, redis }: { user: UserTokenContext; redis: Redis }
    ): Promise<Array<Types.ObjectId | NotificationDocument>> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        const userNotifications: Array<UserDocument> = await User.aggregate([
          {
            $match: { _id: Types.ObjectId(user.userId) },
          },
          {
            $lookup: {
              from: "notifications",
              let: { notifications: "$notifications" },
              pipeline: [
                {
                  $match: {
                    // Filter notification by community id
                    community: Types.ObjectId(communityId),
                    $expr: { $in: ["$_id", "$$notifications"] },
                  },
                },
                {
                  $lookup: {
                    from: "bookings",
                    let: { booking: "$booking" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$booking"] } } },
                      {
                        $lookup: {
                          from: "posts",
                          localField: "post",
                          foreignField: "_id",
                          as: "post",
                        },
                      },
                      {
                        $unwind: {
                          path: "$post",
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                    as: "booking",
                  },
                },
                {
                  $unwind: {
                    path: "$booking",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: "posts",
                    let: { post: "$post" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$post"] } } },
                      {
                        $lookup: {
                          from: "users",
                          localField: "creator",
                          foreignField: "_id",
                          as: "creator",
                        },
                      },
                      { $unwind: "$creator" },
                    ],
                    as: "post",
                  },
                },
                {
                  $unwind: {
                    path: "$post",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    let: { participants: "$participants" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              {
                                $in: ["$_id", "$$participants"],
                              },
                              {
                                $ne: ["$_id", Types.ObjectId(user.userId)],
                              },
                            ],
                          },
                        },
                      },
                    ],
                    as: "participants",
                  },
                },
                {
                  $lookup: {
                    from: "messages",
                    localField: "messages",
                    foreignField: "_id",
                    as: "messages",
                  },
                },
                {
                  $addFields: {
                    messages: { $slice: ["$messages", -1] },
                  },
                },
                {
                  $sort: {
                    updatedAt: -1,
                  },
                },
              ],
              as: "notifications",
            },
          },
        ]);

        // Delete community key of notifications:userId hash
        await redis.hdel(`notifications:${user.userId}`, `${communityId}`);

        // Return user's notifications to client
        return userNotifications[0].notifications;
      } catch (err) {
        throw new Error(err);
      }
    },
    findNotification: async (
      _: unknown,
      {
        recipientId,
        communityId,
      }: { recipientId: string; communityId: string },
      { user }: { user: UserTokenContext }
    ): Promise<NotificationDocument | null> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find a notification where both of users participates in and of
        // type 0 and in the given community
        const notification: NotificationDocument | null = await Notification.findOne(
          {
            ofType: 0,
            participants: { $all: [recipientId, user.userId] },
            community: communityId,
          }
        );

        // Return chat/notification object if it is found
        return notification;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createNotification: async (
      _: unknown,
      {
        notificationInput: { ofType, recipientId, communityId, bookingInput },
      }: { notificationInput: NotificationInput },
      { user, redis }: { user: UserTokenContext; redis: Redis }
    ): Promise<NotificationDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Declare top level variables
        let booking: BookingDocument | undefined;
        let post: PostDocument | null | undefined;
        let recipient: UserDocument | null | undefined;
        let existingChat: NotificationDocument | null;

        // If type is 0 (i.e chat), create chat notification
        if (ofType === 0) {
          // Check if chat that contains both user exists and in the given community
          existingChat = await Notification.findOne({
            ofType: 0,
            participants: { $all: [recipientId, user.userId] },
            community: communityId,
          });

          // Return chat notification if it exists
          if (existingChat) return existingChat;

          // If type is 1 (i.e booking), create booking
        } else if (ofType === 1 && bookingInput) {
          // Destruct variables from bookingInput
          const {
            postId,
            dateType,
            status,
            dateNeed,
            dateReturn,
          } = bookingInput;

          // Create & save booking && get parent post && recipient
          [booking, post, recipient] = await Promise.all([
            Booking.create({
              post: postId,
              status,
              dateType,
              ...(dateType === 2 && { dateNeed, dateReturn }),
              booker: user.userId,
              community: communityId,
            }),
            Post.findById(postId),
            User.findById(recipientId),
          ]);

          if (!post) throw new ApolloError("Post not found");
          if (!recipient) throw new ApolloError("User not found");

          // Add booking to post bookings
          post.bookings.push(booking);

          // Save post & sent booking email to recipient if recipient is subscribed to email
          await Promise.all([
            post.save(),
            process.env.NODE_ENV === "production" &&
              recipient.isNotified &&
              updateBookingMail(
                `${process.env.ORIGIN}/notifications`,
                recipient.email,
                `${user.userName} has requested to book your ${post.title}`
              ),
          ]);
        }

        // Create & save notification, add booking to notification if it is type 1
        const notification = await Notification.create({
          ...(ofType === 1 && booking && { booking: booking._id }),
          ofType,
          participants: [recipientId, user.userId],
          // Notification read status for participants
          isRead: {
            [recipientId]: false,
            [user.userId]: false,
          },
          community: communityId,
        });

        // Save notification to recipient & current user && save notification:recipientId to redis
        await Promise.all([
          User.updateMany(
            { _id: { $in: [recipientId, user.userId] } },
            {
              $push: {
                notifications: notification,
              },
            }
          ),
          // Set communityId key to notifications:userId hash in redis
          redis.hset(
            `notifications:${recipientId}`,
            new Map([[`${communityId}`, "true"]])
          ),
        ]);

        // Get participants and add to return value
        const participants = await User.find({
          _id: { $in: [recipientId, user.userId] },
        });

        // Send push notification if created notification is not chat
        if (ofType !== 0 && post && recipient) {
          // Send push notification to item owner
          pushNotification(
            {
              communityId,
              recipientId,
            },
            `${user.userName} has requested to book your ${post.title}`,
            [
              {
                _id: recipient._id,
                fcmTokens: recipient.fcmTokens,
              },
            ]
          );
        }

        // Return notification object with participants & booking if it is type 1
        return {
          // @ts-ignore
          ...notification._doc,
          participants,
          ...(ofType === 1 && {
            // @ts-ignore
            booking: { ...booking._doc, post: post._doc },
          }),
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default notificationsResolvers;
