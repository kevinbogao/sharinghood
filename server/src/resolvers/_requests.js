const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const Thread = require('../models/thread');
const Request = require('../models/request');
const Community = require('../models/community');
const Notification = require('../models/notification');
const uploadImg = require('../middleware/uploadImg');
const newRequestMail = require('../middleware/sendMail/newRequestMail');

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

        console.log(imgData);

        // Create and save request
        const request = await Request.create({
          title,
          desc,
          dateNeed,
          dateReturn,
          image: imgData,
          creator: userId,
          community: communityId,
        });

        // Create & save notification && find creator's community
        const [notification, community] = await Promise.all([
          Notification.create({
            onType: 1,
            onDocId: request._id,
            content: `${userName} made a requested for ${title} in your community`,
            creator: userId,
            isRead: false,
          }),
          Community.findById(communityId),
        ]);

        // Save requestId & notificationId to community
        community.requests.push(request);
        community.notifications.push(notification);
        await community.save();

        // // Send email
        // const info = await newRequestMail(
        //   userName,
        //   title,
        //   imgData.secure_url,
        //   `http://localhost:3000/requests/${request._id}`,
        //   dateNeed,
        //   'k_gao@aol.com, kevinngao@gmail.com',
        //   `${userName} requested ${title} in your community.`
        // );

        // console.log(info);

        return {
          ...request._doc,
          creator: {
            _id: userId,
            name: userName,
          },
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    deleteRequest: async (_, { requestId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { communityId } = user;

      try {
        // Find request & get request's threads
        const request = await Request.findById(requestId);
        const { threads } = request;

        // Delete request, requestId from community & delete request threads
        await Promise.all([
          request.remove(),
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
