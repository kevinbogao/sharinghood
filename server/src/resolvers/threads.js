const { AuthenticationError } = require('apollo-server');
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
        // Create & save thread && get parent (post or request)
        const [thread, parent] = await Promise.all([
          Thread.create({
            content,
            poster: userId,
          }),
          isPost ? Post.findById(parentId) : Request.findById(parentId),
        ]);

        // Add threadId to post/request
        parent.threads.push(thread);
        await parent.save();

        // Create notification object if poster in user & get user
        if (userId !== recipientId) {
          const [notification, recipient] = await Promise.all([
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
            User.findOne({ _id: recipientId }),
          ]);

          // Save notification to recipient
          recipient.notifications.push(notification);
          await recipient.save();
        }

        return thread;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = threadsResolvers;
