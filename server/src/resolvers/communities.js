const { ForbiddenError } = require('apollo-server');
const mongoose = require('mongoose');
const Community = require('../models/community');

const communitiesResolvers = {
  Query: {
    community: async (_, __, { user: { communityId } }) => {
      try {
        // Find community by id & populate users
        const community = await Community.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(communityId) },
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
    findCommunity: async (_, { communityCode }) => {
      try {
        // Find community and populate users
        const community = await Community.aggregate([
          { $match: { code: communityCode } },
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'members',
            },
          },
        ]);

        // Throw error if community is not found (returns empty array)
        // if (!community.length) {
        //   throw new Error("Community doesn't exist");
        // }

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
