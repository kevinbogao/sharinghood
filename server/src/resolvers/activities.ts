import { AuthenticationError } from "apollo-server";
import { Types } from "mongoose";
import User from "../models/user";
import Post from "../models/post";
import Request from "../models/request";
import Booking, { BookingDocument } from "../models/booking";
import Community, { CommunityDocument } from "../models/community";
import { UserTokenContext } from "../utils/authToken";

interface CommunitiesActivities {
  totalCommunities: number;
  totalUsers: number;
  totalPosts: number;
  totalRequests: number;
  totalBookings: number;
  communitiesActivities: Array<CommunityDocument>;
}

// interface CommunityActivitiesRes extends CommunityDocument {
//   // _id: Types.ObjectId;
//   numUsers: number;
//   numPosts: number;
//   numRequests: number;
//   numBookings: number;
//   bookings: Array<BookingDocument>;
// }

const activitiesResolvers = {
  Query: {
    totalActivities: async (
      _: unknown,
      __: unknown,
      { user }: { user: UserTokenContext }
    ): Promise<CommunitiesActivities> => {
      try {
        // Throw auth error is user is not admin
        if (!user || !user.isAdmin) {
          throw new AuthenticationError("Not permitted");
        }

        const totalCommunities: number = await Community.countDocuments();
        const totalUsers: number = await User.countDocuments();
        const totalPosts: number = await Post.countDocuments();
        const totalRequests: number = await Request.countDocuments();
        const totalBookings: number = await Booking.countDocuments();

        // Get all communities stats
        const communitiesActivities: Array<CommunityDocument> = await Community.aggregate(
          [
            {
              $match: { _id: { $exists: true } },
            },
            {
              $lookup: {
                from: "posts",
                localField: "posts",
                foreignField: "_id",
                as: "posts",
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                code: 1,
                numUsers: { $size: "$members" },
                numPosts: { $size: "$posts" },
                numRequests: { $size: "$requests" },
                numBookings: {
                  $sum: {
                    $map: { input: "$posts", in: { $size: "$$this.bookings" } }, // TODO: need better filter
                  },
                },
              },
            },
          ]
        );

        return {
          totalCommunities,
          totalUsers,
          totalPosts,
          totalRequests,
          totalBookings,
          communitiesActivities,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    communityActivities: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: UserTokenContext }
    ) => {
      if (!user || !user.isAdmin) {
        throw new AuthenticationError("Not permitted");
      }

      try {
        const communityActivities: Array<CommunityDocument> = await Community.aggregate(
          [
            { $match: { _id: Types.ObjectId(communityId) } },
            {
              $lookup: {
                from: "users",
                localField: "members",
                foreignField: "_id",
                as: "members",
              },
            },
            {
              $lookup: {
                from: "posts",
                localField: "posts",
                foreignField: "_id",
                as: "posts",
              },
            },
            {
              $lookup: {
                from: "requests",
                localField: "requests",
                foreignField: "_id",
                as: "requests",
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                code: 1,
                zipCode: 1,
                creator: 1,
                members: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  image: 1,
                  isNotified: 1,
                  createdAt: 1,
                  lastLogin: 1,
                },
                posts: {
                  _id: 1,
                  title: 1,
                  desc: 1,
                  condition: 1,
                  image: 1,
                  creator: 1,
                  isGiveaway: 1,
                  createdAt: 1,
                },
                requests: {
                  _id: 1,
                  title: 1,
                  desc: 1,
                  dateType: 1,
                  dateNeed: 1,
                  dateReturn: 1,
                  image: 1,
                  creator: 1,
                  createdAt: 1,
                },
              },
            },
          ]
        );

        // Get bookings from community
        const bookings: Array<BookingDocument> | null = await Booking.find({
          community: communityId,
        });

        return {
          ...communityActivities[0],
          bookings,
        };
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default activitiesResolvers;
