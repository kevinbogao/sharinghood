const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Thread = require('../models/thread');
const Request = require('../models/request');
const Community = require('../models/community');
const Notification = require('../models/notification');
const uploadImg = require('../middleware/uploadImg');

const requestsResolvers = {
  Query: {
    request: async (_, { requestId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get request && lookup creator & threads
        const request = await Request.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(requestId) },
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
              localField: 'threads',
              foreignField: '_id',
              as: 'threads',
            },
          },
        ]);

        return request[0];
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    requests: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { communityId } = user;

      try {
        // Get all requests from given community
        const communityRequests = await Community.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(communityId) },
          },
          {
            $lookup: {
              from: 'requests',
              let: { requests: '$requests' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$requests'] } } },
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
              as: 'requests',
            },
          },
          {
            $project: { requests: 1 },
          },
        ]);

        return communityRequests[0].requests;
      } catch (err) {
        console.log(err);
        return err;
      }
    },
  },
  Mutation: {
    createRequest: async (
      _,
      { requestInput: { title, desc, image, dateNeed, dateReturn } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName, communityId } = user;

      try {
        // Upload image to Cloudinary
        const imgData = await uploadImg(image);

        // Create a new request object
        const request = new Request({
          title,
          desc,
          dateNeed,
          dateReturn,
          image: imgData,
          creator: userId,
          community: communityId,
        });

        // Save request & find creator
        const [result, creator] = await Promise.all([
          request.save(),
          User.findById(userId),
        ]);

        // Create & save notification && find creator's community
        const [notification, community] = await Promise.all([
          Notification.create({
            onType: 1,
            onDocId: result.id,
            content: `${userName} made a requested for ${title} in your community`,
            creator: userId,
            isRead: false,
          }),
          Community.findById(creator.community),
        ]);

        // Save requestId & notificationId to community && postId to creator
        community.requests.push(request);
        community.notifications.push(notification);
        creator.createdRequests.push(request);
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
    deleteRequest: async (_, { requestId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, communityId } = user;

      try {
        const request = await Request.findById(requestId);
        const { threads } = request;

        // Delete Post; delete postId from user, community && delete
        // all post threads & bookings
        await Promise.all([
          request.remove(),
          User.updateOne(
            { _id: userId },
            {
              $pull: {
                createRequest: requestId,
              },
            }
          ),
          Community.updateOne(
            { _id: communityId },
            {
              $pull: { requests: requestId },
            }
          ),
          Thread.deleteMany({ _id: threads }),
        ]);

        return request;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = requestsResolvers;
