const { AuthenticationError } = require('apollo-server');
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
        const request = await Request.findById(requestId)
          .populate('creator')
          .populate({
            path: 'threads',
            populate: { path: 'poster', model: 'User' },
          });

        return request;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    requests: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { communityId } = user;

      try {
        const requests = await Request.find({
          community: communityId,
        }).populate('creator');

        return requests;
      } catch (err) {
        console.log(err);
        return err;
      }
    },
  },
  Mutation: {
    createRequest: async (
      _,
      { requestInput: { desc, picture, dateNeed, dateReturn } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName, communityId } = user;

      try {
        const imgUrl = await uploadImg(picture);

        const request = new Request({
          desc,
          dateNeed,
          dateReturn,
          picture: imgUrl,
          creator: userId,
          community: communityId,
        });

        const result = await request.save();

        const creator = await User.findById(userId);
        creator.createdRequests.push(request);
        await creator.save();

        const notification = await Notification.create({
          onType: 1,
          onDocId: result.id,
          content: `${userName} made a requested for ${desc} in your community`,
          creator: userId,
          isRead: false,
        });

        const community = await Community.findById(creator.community);
        community.requests.push(request);
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
    deleteRequest: async (_, { requestId }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, communityId } = user;

      try {
        const request = await Request.findById(requestId);
        const { threads } = request;
        await request.remove();
        await User.updateOne(
          { _id: userId },
          {
            $pull: {
              createRequest: requestId,
            },
          }
        );
        await Community.updateOne(
          { _id: communityId },
          {
            $pull: { requests: requestId },
          }
        );
        await Thread.deleteMany({ _id: threads });
        return request;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = requestsResolvers;
