const { AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");
const Community = require("../models/community");
const User = require("../models/user");
const Post = require("../models/post");
const Request = require("../models/request");
const Booking = require("../models/booking");

const activitiesResolvers = {
  Query: {
    totalActivities: async (_, __, { user }) => {
      try {
        // Throw auth error is user is not admin
        if (!user || !user.isAdmin) {
          throw new AuthenticationError("Not permitted");
        }

        // Get all communities, users, posts, requests & bookings
        const [
          totalCommunities,
          totalUsers,
          totalPosts,
          totalRequests,
          totalBookings,
        ] = await Promise.all([
          Community.countDocuments(),
          User.countDocuments(),
          Post.countDocuments(),
          Request.countDocuments(),
          Booking.countDocuments(),
        ]);

        // Get all communities stats
        const communitiesActivities = await Community.aggregate([
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
                  $map: { input: "$posts", in: { $size: "$$this.bookings" } },
                },
              },
            },
          },
        ]);

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
    communityActivities: async (_, { communityId }, { user }) => {
      if (!user || !user.isAdmin) {
        throw new AuthenticationError("Not permitted");
      }

      try {
        const communityActivities = await Community.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(communityId) } },
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
                dateNeed: 1,
                dateReturn: 1,
                image: 1,
                creator: 1,
                createdAt: 1,
              },
            },
          },
        ]);

        // Get bookings from community
        const bookings = await Booking.find({ community: communityId });

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

module.exports = activitiesResolvers;
