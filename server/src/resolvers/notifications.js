const { AuthenticationError } = require('apollo-server');
const User = require('../models/user');
const Community = require('../models/community');
const Notification = require('../models/notification');

const notificationsResolvers = {
  Query: {
    notifications: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, communityId } = user;

      try {
        const currentUser = await User.findById(userId);
        const community = await Community.findById(communityId);

        // Get notifications from user & community
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
