const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Thread = require('../models/thread');
const Request = require('../models/request');
const Community = require('../models/community');
const uploadImg = require('../utils/uploadImg');
const newRequestMail = require('../utils/sendMail/newRequestMail');

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
    requests: async (_, { communityId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

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
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
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
      {
        requestInput: { title, desc, image, dateNeed, dateReturn },
        communityId,
      },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName } = user;

      try {
        // Upload image to Cloudinary
        const imgData = await uploadImg(image);

        // Create and save request && get creator
        const [request, creator, community] = await Promise.all([
          Request.create({
            title,
            desc,
            dateNeed,
            dateReturn,
            image: imgData,
            creator: userId,
          }),
          User.findById(userId),
          // Populate community members, exclude current user & unsubscribe user
          // & only return email
          Community.findById(communityId).populate({
            path: 'members',
            match: { _id: { $ne: userId }, isNotified: true },
            select: 'email',
          }),
        ]);

        // Save requestId & notificationId to community && requestId to creator
        community.requests.push(request);
        creator.requests.push(request);

        // parse array of members object into array of emails
        const emails = community.members.map((member) => member.email);

        // Save community & sent email to subscribed users
        await Promise.all([
          community.save(),
          creator.save(),
          process.env.NODE_ENV === 'production' &&
            emails.length &&
            newRequestMail(
              userName,
              title,
              JSON.parse(imgData).secure_url,
              `${process.env.ORIGIN}/requests/${request._id}`,
              dateNeed,
              emails,
              `${userName} requested ${title} in your community.`
            ),
        ]);

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

      try {
        // Find request & currentUser
        const [request, currentUser] = await Promise.all([
          Request.findById(requestId),
          User.findById(user.userId),
        ]);

        // Throw error if user is not post creator
        if (!request.creator.equals(user.userId)) {
          throw new Error('Anauthorised user');
        }

        // Destruct threads from request
        const { threads } = request;

        // Delete request, requestId from community & delete request threads
        await Promise.all([
          request.remove(),
          Community.updateMany(
            { _id: { $in: currentUser.communities } },
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
