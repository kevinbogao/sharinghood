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
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
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
      {
        postInput: { title, desc, image, condition, isGiveaway, requesterId },
        communityId,
      },
      { user, redis }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName } = user;

      try {
        // Upload image to Cloudinary
        const imgData = await uploadImg(image);

        // Create & save post && get creator && find creator's community
        // && find requester if the post is in response to a request
        const [post, creator, community, requester] = await Promise.all([
          Post.create({
            desc,
            title,
            condition,
            isGiveaway,
            image: imgData,
            creator: userId,
          }),
          User.findById(userId),
          communityId && Community.findById(communityId),
          requesterId && User.findById(requesterId),
        ]);

        // Only save to community if communityId is given, i.e user is
        // uploading the post to a specific community
        if (communityId) {
          community.posts.push(post);
        }

        // Create notification if requesterId is given
        if (requesterId) {
          const notification = await Notification.create({
            ofType: 2,
            post: post._id,
            participants: [requesterId, user.userId],
            isRead: {
              [requesterId]: false,
              [user.userId]: false,
            },
            community: communityId,
          });

          // Add notification to requester
          requester.notifications.push(notification);

          // Save requester & set communityId key to notifications:userId hash in redis
          await Promise.all([
            requester.save(),
            redis.hset(`notifications:${requesterId}`, `${communityId}`, true),
          ]);
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
    updatePost: async (
      _,
      { postInput: { postId, title, desc, image, condition } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Find post by id
        const post = await Post.findById(postId);

        // Upload image if it exists
        let imgData;
        if (image) imgData = await uploadImg(image);

        // Conditionally update post
        if (title) post.title = title;
        if (desc) post.desc = desc;
        if (image && imgData) post.image = imgData;
        if (condition) post.condition = condition;

        // Save & return post
        const updatedPost = await post.save();
        return updatedPost;
      } catch (err) {
        console.log(err);
        throw new Error(err);
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

      console.log(user);

      try {
        // Find post & creator
        const [post, creator] = await Promise.all([
          Post.findById(postId),
          User.findById(user.userId),
        ]);

        // Save thread ids array
        const { threads, bookings } = post;

        // Delete post, postId from community && delete post threads
        // & notifications
        await Promise.all([
          post.remove(),
          Community.updateMany(
            { _id: { $in: creator.communities } },
            { $pull: { posts: postId } }
          ),
          User.updateOne({ _id: user.userId }, { $pull: { posts: postId } }),
          Thread.deleteMany({ _id: threads }),
          Booking.deleteMany({ _id: bookings }),
        ]);

        return post;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    addPostToCommunity: async (_, { postId, communityId }) => {
      try {
        // Get community by id and add post if to the community's
        // posts array; return community
        const community = await Community.findById(communityId);
        community.posts.push(postId);
        await community.save();

        return community;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = postsResolvers;
