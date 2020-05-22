const { ForbiddenError } = require('apollo-server');
const Community = require('../models/community');

const communitiesResolvers = {
  Query: {
    community: async (_, __, { user: { communityId } }) => {
      try {
        const community = await Community.findById(communityId).populate({
          path: 'members',
        });

        if (!community) {
          throw new ForbiddenError("Community doesn't exist");
        }

        return community;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getMembers: async (_, { communityId }) => {
      try {
        const result = await Community.findById(communityId).populate(
          'members'
        );
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    createCommunity: async (_, { communityInput: { name, code, zipCode } }) => {
      const community = new Community({ name, code, zipCode });

      try {
        const existingCode = await Community.findOne({ code });
        if (existingCode) {
          throw new ForbiddenError('Community code exists already');
        }
        const result = await community.save();
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    community: async (_, { communityCode }) => {
      try {
        const community = await Community.findOne({
          code: communityCode,
        }).populate('members');
        if (!community) {
          throw new ForbiddenError("Community doesn't exist");
        }
        return community;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = communitiesResolvers;
