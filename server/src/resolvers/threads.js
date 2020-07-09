const { AuthenticationError } = require('apollo-server');
const Post = require('../models/post');
const Thread = require('../models/thread');
const Request = require('../models/request');

const threadsResolvers = {
  Mutation: {
    createThread: async (
      _,
      { threadInput: { content, isPost, parentId, communityId } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Create & save thread && get parent (post or request)
        const [thread, parent] = await Promise.all([
          Thread.create({
            content,
            poster: userId,
            community: communityId,
          }),
          isPost ? Post.findById(parentId) : Request.findById(parentId),
        ]);

        // Add threadId to post/request
        parent.threads.push(thread);
        await parent.save();

        return thread;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = threadsResolvers;
