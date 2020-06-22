const { ForbiddenError } = require('apollo-server');
const mongoose = require('mongoose');
const Community = require('../models/community');

const communitiesResolvers = {
  Query: {
    community: async (_, { communityCode }, { user }) => {
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
                    _id: mongoose.Types.ObjectId(user.communityId),
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
