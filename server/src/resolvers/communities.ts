// @ts-nocheck
import { AuthenticationError } from "apollo-server";
import { mongoose } from "mongoose";
const User = require("../models/user");
import Community from "../models/community";
const handleErrors = require("../utils/handleErrors");

import { ICommunity } from "../types/models";
import { UserContext } from "../types/server";

const communitiesResolvers = {
  Query: {
    community: async (
      _: any,
      {
        communityId,
        communityCode,
      }: { communityId: string; communityCode: string }
    ) => {
      try {
        // Find community by community code if communityCode is given
        // else find community by id & populate users
        const community: Array<ICommunity> = await Community.aggregate([
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
              from: "users",
              localField: "members",
              foreignField: "_id",
              as: "members",
            },
          },
        ]);

        return community[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    communities: async (
      _: any,
      __: any,
      { user, redis }: { user: UserContext; redis: any }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        const userCommunities: Array<IUser> = await User.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(user.userId) } },
          {
            $lookup: {
              from: "communities",
              localField: "communities",
              foreignField: "_id",
              as: "communities",
            },
          },
        ]);

        // TODO: remove Promise.all()
        // Get hasNotifications value from redis hash for each community of user
        const communities = await Promise.all(
          userCommunities[0].communities.map(async (community) => {
            const hasNotifications = await redis.hget(
              `notifications:${user.userId}`,
              `${community._id}`
            );
            return {
              ...community,
              hasNotifications: hasNotifications === "true" || false,
            };
          })
        );

        return communities;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createCommunity: async (
      _,
      { communityInput: { name, code, zipCode } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Create & save community && get user
        const [community, currentUser] = await Promise.all([
          Community.create({
            name,
            code,
            zipCode,
            creator: user.userId,
          }),
          User.findById(user.userId),
        ]);

        // Add user to community, and add community to user
        community.members.push(user.userId);
        currentUser.communities.push(community._id);
        await Promise.all([community.save(), currentUser.save()]);

        return community;
      } catch (err) {
        // Throw duplicate error
        return handleErrors(err);
      }
    },
    joinCommunity: async (_, { communityId }, { user }) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get current user & community
        const [currentUser, community] = await Promise.all([
          User.findById(user.userId),
          Community.findById(communityId),
        ]);

        // Save user to community members and save community to
        // user communities
        currentUser.communities.push(communityId);
        community.members.push(user.userId);
        await Promise.all([currentUser.save(), community.save()]);

        return community;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default communitiesResolvers;
