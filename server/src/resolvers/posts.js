const { AuthenticationError } = require('apollo-server');
const Post = require('../models/post');
const User = require('../models/user');
const Thread = require('../models/thread');
const Community = require('../models/community');
const Notification = require('../models/notification');
const uploadImg = require('../middleware/uploadImg');

const postsResolvers = {
  Query: {
    post: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const post = await Post.findById(postId)
          .populate('creator')
          .populate({
            path: 'threads',
            populate: { path: 'poster', model: 'User' },
          });

        return post;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    posts: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { communityId } = user;

      try {
        const community = await Community.findOne({ _id: communityId });
        const posts = await Post.find({
          _id: { $in: community.posts },
        }).populate('creator');

        return posts;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    createPost: async (
      _,
      { postInput: { title, desc, picture, condition, isGiveaway } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName, communityId } = user;

      try {
        const imgUrl = await uploadImg(picture);

        const post = new Post({
          desc,
          title,
          condition,
          isGiveaway,
          picture: imgUrl,
          creator: userId,
          community: communityId,
        });

        const result = await post.save();

        const creator = await User.findById(userId);
        creator.createdPosts.push(post);
        await creator.save();

        const notification = await Notification.create({
          onType: 0,
          onDocId: result.id,
          content: `${userName} shared ${title} in your community`,
          creator: userId,
          isRead: false,
        });

        const community = await Community.findById(creator.community);
        community.posts.push(post);
        community.notifications.push(notification);
        await community.save();

        return {
          ...result._doc,
          creator: {
            _id: creator._id,
            name: creator.name,
          },
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    deletePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, communityId } = user;

      try {
        // Find post
        const post = await Post.findById(postId);

        // Save thread ids array
        const { threads, bookings } = post;

        // Delete Post
        await post.remove();

        // Delete post id from user
        await User.updateOne(
          { _id: userId },
          { $pull: { createdPosts: postId } }
        );

        // Delete post id from community
        await Community.updateOne(
          { _id: communityId },
          { $pull: { posts: postId } }
        );

        // Delete all post threads & bookings
        await Thread.deleteMany({ _id: threads });
        await Thread.deleteMany({ _id: bookings });

        return post;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = postsResolvers;
