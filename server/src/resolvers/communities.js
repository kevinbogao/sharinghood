const { AuthenticationError, ForbiddenError } = require('apollo-server');
const mongoose = require('mongoose');
const Community = require('../models/community');
const User = require('../models/user');

const communitiesResolvers = {
  Query: {
    // community: async (_, { communityCode }, { user }) => {
    community: async (_, { communityId, communityCode }) => {
      try {
        // Find community by community code if communityCode is given
        // else find community by id & populate users
        const community = await Community.aggregate([
          {
            $match: {
              ...(communityCode
                ? // Query by community code
                  { code: communityCode }
                : // Query by community id
                  {
                    _id: mongoose.Types.ObjectId(communityId),
                  }),
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'members',
            },
          },
        ]);

        return community[0];
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    communities: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const userCommunities = await User.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(user.userId) } },
          {
            $lookup: {
              from: 'communities',
              localField: 'communities',
              foreignField: '_id',
              as: 'communities',
            },
          },
        ]);

        return userCommunities[0].communities;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createCommunity: async (_, { communityInput: { name, code, zipCode } }) => {
      try {
        // Check if community code exists
        const existingCode = await Community.findOne({ code });

        if (existingCode) {
          throw new ForbiddenError('Community code exists already');
        }

        // Create & save community
        const community = await Community.create({
          name,
          code,
          zipCode,
        });

        return community;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = communitiesResolvers;
