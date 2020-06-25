const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Thread = require('../models/thread');
const Booking = require('../models/booking');
const Community = require('../models/community');
const Notification = require('../models/notification');
const uploadImg = require('../utils/uploadImg');

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
    posts: async (_, { communityId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

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
      { postInput: { title, desc, image, condition, isGiveaway }, communityId },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName } = user;

      try {
        // Upload image to Cloudinary
        const imgData = await uploadImg(image);

        // Create & save post && get creator
        const [post, creator] = await Promise.all([
          Post.create({
            desc,
            title,
            condition,
            isGiveaway,
            image: imgData,
            creator: userId,
          }),
          User.findById(userId),
        ]);

        // Create & save notification && find creator's community
        const [notification, community] = await Promise.all([
          Notification.create({
            onType: 0,
            onDocId: post._id,
            content: `${userName} shared ${title} in your community`,
            creator: userId,
            isRead: false,
          }),
          communityId && Community.findById(communityId),
        ]);

        // Save postId & notificationId to community && postId to creator
        // Only save to community if communityId is given, i.e user is
        // uploading the post to a specific community
        if (communityId) {
          community.posts.push(post);
          community.notifications.push(notification);
        }
        creator.posts.push(post);
        await Promise.all([communityId && community.save(), creator.save()]);

        return {
          ...post._doc,
          creator: {
            _id: userId,
            name: userName,
          },
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    inactivatePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const userInfo = await User.findById(user.userId);

        // Find user's communities and remove post from
        // all communities' posts array
        await Community.updateMany(
          {
            _id: { $in: userInfo.communities },
          },
          {
            $pull: { posts: postId },
          }
        );

        return true;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    deletePost: async (_, { postId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { communityId } = user;

      try {
        // Find post
        const post = await Post.findById(postId);

        // Save thread ids array
        const { threads, bookings } = post;

        // Delete post, postId from community && delete post threads
        // & notifications
        await Promise.all([
          post.remove(),
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
