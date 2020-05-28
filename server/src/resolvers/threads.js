const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Thread = require('../models/thread');
const Request = require('../models/request');
const Notification = require('../models/notification');

const threadsResolvers = {
  Mutation: {
    createThread: async (
      _,
      { threadInput: { content, isPost, parentId, recipientId } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName } = user;

      try {
        // Create thread object
        const thread = new Thread({
          content,
          poster: userId,
        });

        // Save thread & get parent (post or request)
        const [result, parent] = await Promise.all([
          thread.save(),
          isPost ? Post.findById(parentId) : Request.findById(parentId),
        ]);

        // Add threadId to post/request
        parent.threads.push(thread);
        await parent.save();

        // Create notification object if poster in user & get user
        // & save notification to user
        if (userId !== recipientId) {
          const [notification, recipient] = Promise.all([
            Notification.create({
              onType: isPost ? 0 : 1,
              onDocId: parent.id,
              content: `${userName} has commented on your ${
                isPost ? 'post' : 'request'
              }`,
              recipient: recipientId,
              creator: userId,
              isRead: false,
            }),
            User.findById(recipientId),
          ]);

          // Save notification to user
          recipient.notifications.push(notification);
          await recipient.save();
        }

        // Get saved thread and its poster
        const savedResult = await Thread.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(result.id) },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'poster',
              foreignField: '_id',
              as: 'poster',
            },
          },
          { $unwind: '$poster' },
        ]);

        return savedResult[0];
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = threadsResolvers;
