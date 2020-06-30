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
        const notification = await Notification.aggregate([
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
          { $unwind: '$booking' },
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
        ]);

        return notification[0];
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },

    notifications: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

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
              { $unwind: '$booking' },
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
            ],
            as: 'notifications',
          },
        },
      ]);

      console.log(userNotifications[0].notifications);

      return userNotifications[0].notifications;

      // return 1;
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
      {
        notificationInput: {
          bookingInput: { postId, dateType, status, dateNeed, dateReturn },
          onType,
          recipientId,
        },
      },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      console.log(onType);
      console.log(recipientId);

      try {
        let booking;
        if (onType === 0) {
          booking = await Booking.create({
            post: postId,
            status,
            dateType,
            ...(dateType === 2 && { dateNeed, dateReturn }),
            booker: user.userId,
          });
        }

        const notification = await Notification.create({
          ...(onType === 0 && { booking: booking._id }),
          onType,
          participants: [recipientId, user.userId],
        });

        console.log(booking);
        console.log(notification);

        // Get post, recipient & current user by id
        const [post, recipient, currentUser] = await Promise.all([
          Post.findById(postId),
          User.findById(recipientId),
          User.findById(user.userId),
        ]);

        // Write booking to post, and write notification to recipient and
        // current user && save
        post.bookings.push(booking._id);
        recipient.notifications.push(notification._id);
        currentUser.notifications.push(notification._id);
        await Promise.all([post.save(), recipient.save(), currentUser.save()]);

        console.log(post);
        console.log(recipient);
        console.log(currentUser);

        return 1;
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
