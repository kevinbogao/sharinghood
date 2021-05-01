import { AuthenticationError } from "apollo-server";
import { Types } from "mongoose";
import { UserContext } from "../types";
import handleErrors from "../utils/handleErrors";
import User, { UserDocument } from "../models/user";
import Community, { CommunityDocument } from "../models/community";

export interface CommunityInput {
  name: string;
  code: string;
  zipCode?: string;
  password?: string;
}

const communitiesResolvers = {
  Query: {
    community: async (
      _: unknown,
      {
        communityId,
        communityCode,
      }: { communityId: string; communityCode: string }
    ): Promise<CommunityDocument> => {
      try {
        // Find community by community code if communityCode is given
        // else find community by id & populate users
        const community: Array<CommunityDocument> = await Community.aggregate([
          {
            $match: {
              ...(communityCode
                ? // Query by community code
                  { code: communityCode }
                : // Query by community id
                  {
                    _id: Types.ObjectId(communityId),
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
      _: unknown,
      __: unknown,
      { user, redis }: { user: UserContext; redis: any }
    ): Promise<Array<CommunityDocument> | number> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        const userCommunities: Array<UserDocument> = await User.aggregate([
          { $match: { _id: Types.ObjectId(user.userId) } },
          {
            $lookup: {
              from: "communities",
              localField: "communities",
              foreignField: "_id",
              as: "communities",
            },
          },
        ]);

        if (userCommunities.length > 0) {
          // TODO: remove Promise.all()
          // Get hasNotifications value from redis hash for each community of user
          const communities = await Promise.all(
            userCommunities[0].communities.map(async (community: any) => {
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
        }

        return 0;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createCommunity: async (
      _: unknown,
      {
        communityInput: { name, code, zipCode },
      }: { communityInput: CommunityInput },
      { user }: { user: UserContext }
    ): Promise<CommunityDocument | null> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Create & save community && get user
        const community: CommunityDocument = await Community.create({
          name,
          code,
          zipCode,
          creator: user.userId,
        });
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        );

        if (community && currentUser) {
          // Add user to community, and add community to user
          community.members.push(Types.ObjectId(user.userId));
          currentUser.communities.push(community._id);
          await Promise.all([community.save(), currentUser.save()]);

          return community;
        }

        return null;
      } catch (err) {
        // Throw duplicate error
        return handleErrors(err);
      }
    },
    joinCommunity: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: UserContext }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get current user & community
        const community: CommunityDocument | null = await Community.findById(
          communityId
        );
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        );

        if (community && currentUser) {
          // Save user to community members and save community to
          // user communities
          currentUser.communities.push(Types.ObjectId(communityId));
          community.members.push(Types.ObjectId(user.userId));
          await Promise.all([currentUser.save(), community.save()]);

          return community;
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default communitiesResolvers;
