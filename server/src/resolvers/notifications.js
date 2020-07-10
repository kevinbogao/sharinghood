const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Booking = require('../models/booking');
// const Community = require('../models/community');
const Notification = require('../models/notification');
const updateBookingMail = require('../utils/sendMail/updateBookingMail');

const notificationsResolvers = {
  Query: {
    notification: async (_, { notificationId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get notification & populate data && get notification mongoose instance
        // eslint-disable-next-line
        const [notification, updateNotification] = await Promise.all([
          Notification.aggregate([
            {
              $match: { _id: mongoose.Types.ObjectId(notificationId) },
            },
            {
              $lookup: {
                from: 'bookings',
                let: { booking: '$booking' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$booking'] } } },
                  {
                    $lookup: {
                      from: 'posts',
                      localField: 'post',
                      foreignField: '_id',
                      as: 'post',
                    },
                  },
                  { $unwind: '$post' },
                ],
                as: 'booking',
              },
            },
            {
              $unwind: {
                path: '$booking',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { participants: '$participants' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', '$$participants'],
                          },
                          {
                            $ne: ['$_id', mongoose.Types.ObjectId(user.userId)],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: 'participants',
              },
            },
            {
              $lookup: {
                from: 'messages',
                localField: 'messages',
                foreignField: '_id',
                as: 'messages',
              },
            },
          ]),
          // Update isRead of current user to true via MongoDB API to
          // avoid mongoose's auto timestamp
          Notification.collection.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(notificationId) },
            { $set: { [`isRead.${user.userId}`]: true } }
          ),
        ]);

        return notification[0];
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    // TODO: filter notifications by communityId
    notifications: async (_, { communityId }, { user, redis }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const userNotifications = await User.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(user.userId) },
          },
          {
            $lookup: {
              from: 'notifications',
              let: { notifications: '$notifications' },
              pipeline: [
                {
                  $match: {
                    // Filter notification by community id
                    community: mongoose.Types.ObjectId(communityId),
                    $expr: { $in: ['$_id', '$$notifications'] },
                  },
                },
                {
                  $lookup: {
                    from: 'bookings',
                    let: { booking: '$booking' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$booking'] } } },
                      {
                        $lookup: {
                          from: 'posts',
                          localField: 'post',
                          foreignField: '_id',
                          as: 'post',
                        },
                      },
                      {
                        $unwind: {
                          path: '$post',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                    as: 'booking',
                  },
                },
                {
                  $unwind: {
                    path: '$booking',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'posts',
                    let: { post: '$post' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$post'] } } },
                      {
                        $lookup: {
                          from: 'users',
                          localField: 'creator',
                          foreignField: '_id',
                          as: 'creator',
                        },
                      },
                      { $unwind: '$creator' },
                    ],
                    as: 'post',
                  },
                },
                {
                  $unwind: {
                    path: '$post',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'users',
                    let: { participants: '$participants' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              {
                                $in: ['$_id', '$$participants'],
                              },
                              {
                                $ne: [
                                  '$_id',
                                  mongoose.Types.ObjectId(user.userId),
                                ],
                              },
                            ],
                          },
                        },
                      },
                    ],
                    as: 'participants',
                  },
                },
                {
                  $lookup: {
                    from: 'messages',
                    localField: 'messages',
                    foreignField: '_id',
                    as: 'messages',
                  },
                },
                {
                  $addFields: {
                    messages: { $slice: ['$messages', -1] },
                  },
                },
                {
                  $sort: {
                    updatedAt: -1,
                  },
                },
              ],
              as: 'notifications',
            },
          },
        ]);

        // Delete community key of notifications:userId hash
        await redis.hdel(`notifications:${user.userId}`, `${communityId}`);

        // Return user's notifications to client
        return userNotifications[0].notifications;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    findNotification: async (_, { recipientId, communityId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Find a notification where both of users participates in and of
        // type 0 and in the given community
        const notification = await Notification.findOne({
          ofType: 0,
          participants: [recipientId, user.userId],
          community: communityId,
        });

        // Return chat/notification object if it is found
        return notification;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createNotification: async (
      _,
      { notificationInput: { ofType, recipientId, communityId, bookingInput } },
      { user, redis }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Declare top level variables
        let booking, post, recipient, existingChat;

        // If type is 0 (i.e chat), create chat notification
        if (ofType === 0) {
          // Check if chat that contains both user exists and in the given community
          existingChat = await Notification.findOne({
            ofType: 0,
            participants: [recipientId, user.userId],
            community: communityId,
          });

          // Return chat notification if it exists
          if (existingChat) return existingChat;

          // If type is 1 (i.e booking), create booking
        } else if (ofType === 1) {
          // Destructure variables from bookingInput
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

          // Add booking to post bookings
          post.bookings.push(booking);

          // Save post & sent booking email to recipient if recipient is subscribed to email
          await Promise.all([
            post.save(),
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
          ...(ofType === 1 && { booking: booking._id }),
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
          redis.hset(`notifications:${recipientId}`, `${communityId}`, true),
        ]);

        // Get participants and add to return value
        const participants = await User.find({
          _id: { $in: [recipientId, user.userId] },
        });

        // Return notification object with participants & booking if it is type 1
        return {
          ...notification._doc,
          participants,
          ...(ofType === 1 && {
            booking: {
              ...booking._doc,
              post: post._doc,
            },
          }),
        };
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = notificationsResolvers;
