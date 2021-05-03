import { ApolloError, AuthenticationError } from "apollo-server";
import { Redis } from "ioredis";
import { Types } from "mongoose";
import User, { UserDocument } from "../models/user";
import Community, {
  CommunityDocument,
  CommunityBaseDocument,
} from "../models/community";
import handleErrors from "../utils/handleErrors";
import { UserTokenContext } from "../utils/authToken";

export interface CommunityInput {
  name: string;
  code: string;
  zipCode?: string;
  password?: string;
}

interface CommunityAndHasNotifications extends CommunityBaseDocument {
  _id?: Types.ObjectId;
  hasNotifications: boolean;
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
      { user, redis }: { user: UserTokenContext; redis: Redis }
    ): Promise<Array<CommunityAndHasNotifications>> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get all user's communities
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

        // Get hasNotifications value from redis hash for each community of user
        const communities: Array<CommunityAndHasNotifications> = await Promise.all(
          (userCommunities[0].communities as Array<CommunityDocument>).map(
            async (community: CommunityDocument) => {
              const hasNotifications = await redis.hget(
                `notifications:${user.userId}`,
                `${community._id}`
              );

              return {
                ...community,
                hasNotifications: hasNotifications === "true" || false,
              };
            }
          )
        );

        return communities;
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
      { user }: { user: UserTokenContext }
    ): Promise<CommunityDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get current user, throw error if not found
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        );
        if (!currentUser) throw new ApolloError("Current user not found");

        // Create & save community && get user
        const community: CommunityDocument = await Community.create({
          name,
          code,
          zipCode,
          creator: user.userId,
        });

        // Add user to community, and add community to user
        community.members.push(Types.ObjectId(user.userId));
        currentUser.communities.push(community._id);
        await Promise.all([community.save(), currentUser.save()]);

        return community;
      } catch (err) {
        // Throw duplicate error
        return handleErrors(err);
      }
    },
    joinCommunity: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: UserTokenContext }
    ): Promise<CommunityDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get current user & throw error if user is not found
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        );
        if (!currentUser) throw new ApolloError("User not found");

        // Get community & throw error if user is not found
        const community: CommunityDocument | null = await Community.findById(
          communityId
        );
        if (!community) throw new Error("Community not found");

        // Save user to community members and save community to
        // user communities
        currentUser.communities.push(Types.ObjectId(communityId));
        community.members.push(Types.ObjectId(user.userId));
        await Promise.all([currentUser.save(), community.save()]);

        return community;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default communitiesResolvers;
