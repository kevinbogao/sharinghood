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
        const thread = new Thread({
          content,
          poster: userId,
        });

        // Save thread
        const result = await thread.save();

        // Get post/request
        const parent = isPost
          ? await Post.findById(parentId)
          : await Request.findById(parentId);

        // Add thread id to post/request
        parent.threads.push(thread);
        await parent.save();

        // Create notification
        if (userId !== recipientId) {
          const notification = await Notification.create({
            onType: isPost ? 0 : 1,
            onDocId: parent.id,
            content: `${userName} has commented on your ${
              isPost ? 'post' : 'request'
            }`,
            recipient: recipientId,
            creator: userId,
            isRead: false,
          });

          // Save notification to user
          const recipient = await User.findById(recipientId);
          recipient.notifications.push(notification);
          await recipient.save();
        }

        const savedResult = await Thread.findById(result.id).populate('poster');

        return savedResult;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = threadsResolvers;
