const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Booking = require('../models/booking');
const Community = require('../models/community');
const Notification = require('../models/notification');

const notificationsResolvers = {
  Query: {
    notification: async (_, { notificationId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get notification & populate data && get notification mongoose instance
        const [notification, notificationObj] = await Promise.all([
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
          Notification.findById(notificationId),
        ]);

        // Set isRead of current user to true if isRead is false & save
        if (!notificationObj.isRead[user.userId]) {
          notificationObj.isRead[user.userId] = true;
          notificationObj.markModified('isRead');
          await notificationObj.save();
        }

        return notification[0];
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    notifications: async (_, __, { user, redis }) => {
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
                { $match: { $expr: { $in: ['$_id', '$$notifications'] } } },
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

        // Delete user has notifications status in redis
        await redis.del(`notifications:${user.userId}`);

        // Return user's notifications to client
        return userNotifications[0].notifications;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    hasNotifications: async (_, __, { user, redis }) => {
      try {
        // Get string value of whether the user has notifications from
        // redis, and convert it to boolean value
        const userHasNotifications = await redis.get(
          `notifications:${user.userId}`
        );
        const hasNotificationsBool = userHasNotifications === 'true';

        return hasNotificationsBool;
      } catch (err) {
        return false;
      }
    },
    findNotification: async (_, { recipientId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Create an array of recipients ids
        const participantIds = [recipientId, user.userId];

        // Find a notification where both of users participates in and of type 2
        const notification = await Notification.findOne({
          onType: 2,
          participants: participantIds,
        });

        // Return chat/notification object if it is found
        return notification;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    getNotifications: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, communityId } = user;

      try {
        // Get notifications from user & community
        const [currentUser, community] = await Promise.all([
          User.findById(userId),
          Community.findById(communityId),
        ]);

        const notifications = await Notification.find({
          _id: {
            $in: [...currentUser.notifications, ...community.notifications],
          },
          creator: { $ne: userId },
        }).sort({ createdAt: -1 });

        return notifications;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    createNotification: async (
      _,
      { notificationInput: { onType, recipientId, bookingInput } },
      { user, redis }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Declear booking variable for lower onType === 0 scope
        let booking, post, existingChat;

        // If type === 0 (i.e it is booking related notification)
        if (onType === 0) {
          // Destructure variables from bookingInput
          const {
            postId,
            dateType,
            status,
            dateNeed,
            dateReturn,
            communityId,
          } = bookingInput;

          // Create & save booking && get parent post
          [booking, post] = await Promise.all([
            Booking.create({
              post: postId,
              status,
              dateType,
              ...(dateType === 2 && { dateNeed, dateReturn }),
              booker: user.userId,
              community: communityId,
            }),
            Post.findById(postId),
          ]);

          // Add booking to post bookings & save post
          post.bookings.push(booking);
          await post.save();
        }

        // Create an array of recipients ids
        const participantIds = [recipientId, user.userId];

        // Query for chat that contains both users and of type 2
        if (onType === 2) {
          existingChat = await Notification.findOne({
            onType: 2,
            participants: participantIds,
          });
        }

        // Only create & save notification if no existingChat is found
        if (!existingChat) {
          // Create & save notification, add booking to notification if
          // it is type 0
          const notification = await Notification.create({
            ...(onType === 0 && { booking: booking._id }),
            onType,
            participants: participantIds,
            // Notification read status for participants
            isRead: {
              [recipientId]: false,
              [user.userId]: false,
            },
          });

          // Save notification to recipient & current user && save
          // notification:recipientId to redis
          await Promise.all([
            User.updateMany(
              { _id: { $in: participantIds } },
              {
                $push: {
                  notifications: notification,
                },
              }
            ),
            redis.set(`notifications:${recipientId}`, true),
          ]);

          // Get participants and add to return value
          const participantsObj = await User.find({
            _id: { $in: participantIds },
          });

          return {
            ...notification._doc,
            participants: participantsObj,
            ...(onType === 0 && {
              booking: {
                ...booking._doc,
                post: post._doc,
              },
            }),
          };
        }

        // TODO: return chat?

        // return 1;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    updateNotification: async (
      _,
      { notificationInput: { notificationId, isRead } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const notification = await Notification.findById(notificationId);

        // Update notification as read
        notification.isRead = isRead;
        await notification.save();

        return notification;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = notificationsResolvers;
