const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Thread = require('../models/thread');
const Booking = require('../models/booking');
const Community = require('../models/community');
const Notification = require('../models/notification');
const uploadImg = require('../middleware/uploadImg');

const postsResolvers = {
  Query: {
    post: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get post && lookup creator & threads
        const post = await Post.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(postId) },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'creator',
              foreignField: '_id',
              as: 'creator',
            },
          },
          { $unwind: '$creator' },
          {
            $lookup: {
              from: 'threads',
              let: { threads: '$threads' },
              pipeline: [
                {
                  $match: { $expr: { $in: ['$_id', '$$threads'] } },
                },
              ],
              as: 'threads',
            },
          },
        ]);

        return post[0];
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    posts: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { communityId } = user;

      try {
        // Get all posts from given community
        const communityPosts = await Community.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(communityId) },
          },
          {
            $lookup: {
              from: 'posts',
              let: { posts: '$posts' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$posts'] } } },
                {
                  $lookup: {
                    from: 'users',
                    let: { creator: '$creator' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$creator'] } } },
                    ],
                    as: 'creator',
                  },
                },
                { $unwind: '$creator' },
              ],
              as: 'posts',
            },
          },
          {
            $project: { posts: 1 }, // return posts array only
          },
        ]);

        return communityPosts[0].posts;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    createPost: async (
      _,
      { postInput: { title, desc, image, condition, isGiveaway } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName, communityId } = user;

      try {
        // Upload image to Cloudinary
        const imgData = await uploadImg(image);

        // Create a new post object
        const post = new Post({
          desc,
          title,
          condition,
          isGiveaway,
          image: imgData,
          creator: userId,
          community: communityId,
        });

        // Save post & find creator
        const [result, creator] = await Promise.all([
          post.save(),
          User.findById(userId),
        ]);

        // Create & save notification && find creator's community
        const [notification, community] = await Promise.all([
          Notification.create({
            onType: 0,
            onDocId: result.id,
            content: `${userName} shared ${title} in your community`,
            creator: userId,
            isRead: false,
          }),
          Community.findById(creator.community),
        ]);

        // Save postId & notificationId to community && postId to creator
        community.posts.push(post);
        community.notifications.push(notification);
        creator.createdPosts.push(post);
        await Promise.all([community.save(), creator.save()]);

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

        // Delete Post; delete postId from user, community && delete
        // all post threads & bookings
        await Promise.all([
          post.remove(),
          User.updateOne({ _id: userId }, { $pull: { createdPosts: postId } }),
          Community.updateOne(
            { _id: communityId },
            { $pull: { posts: postId } }
          ),
          Thread.deleteMany({ _id: threads }),
          Booking.deleteMany({ _id: bookings }),
        ]);

        return post;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = postsResolvers;
