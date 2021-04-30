import { AuthenticationError, ForbiddenError } from "apollo-server";
import { Types } from "mongoose";
import User from "../models/user";
import Thread from "../models/thread";
import Request, { RequestDocument } from "../models/request";
import Community, { CommunityDocument } from "../models/community";
import { UserContext } from "../types";

const uploadImg = require("../utils/uploadImg");
const newRequestMail = require("../utils/sendMail/newRequestMail");
const pushNotification = require("../utils/pushNotification");

interface RequestInput {
  title: string;
  desc: string;
  image: string;
  dateType: number;
  dateNeed?: Date;
  dateReturn?: Date;
}

const requestsResolvers = {
  Query: {
    request: async (
      _: unknown,
      { requestId }: { requestId: string },
      { user }: { user: UserContext }
    ): Promise<RequestDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get request && lookup creator & threads
        const request: Array<RequestDocument> = await Request.aggregate([
          {
            $match: { _id: Types.ObjectId(requestId) },
          },
          {
            $lookup: {
              from: "users",
              localField: "creator",
              foreignField: "_id",
              as: "creator",
            },
          },
          { $unwind: "$creator" },
          {
            $lookup: {
              from: "threads",
              localField: "threads",
              foreignField: "_id",
              as: "threads",
            },
          },
        ]);

        return request[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    requests: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: UserContext }
    ): Promise<Array<RequestDocument | Types.ObjectId>> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get all requests from given community
        const communityRequests: Array<CommunityDocument> = await Community.aggregate(
          [
            {
              $match: { _id: Types.ObjectId(communityId) },
            },
            {
              $lookup: {
                from: "requests",
                let: { requests: "$requests" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$requests"] } } },
                  {
                    $lookup: {
                      from: "users",
                      let: { creator: "$creator" },
                      pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$creator"] } } },
                      ],
                      as: "creator",
                    },
                  },
                  { $unwind: "$creator" },
                  {
                    $sort: {
                      createdAt: -1,
                    },
                  },
                ],
                as: "requests",
              },
            },
            {
              $project: { requests: 1 },
            },
          ]
        );

        return communityRequests[0].requests;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createRequest: async (
      _: unknown,
      {
        requestInput: { title, desc, image, dateType, dateNeed, dateReturn },
        communityId,
      }: { requestInput: RequestInput; communityId: string },
      { user }: { user: UserContext }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId, userName }: { userId: string; userName: string } = user;

      try {
        // Upload image to Cloudinary
        const imgData = await uploadImg(image);

        // Create and save request && get creator
        const [request, creator, community] = await Promise.all([
          Request.create({
            title,
            desc,
            dateType,
            ...(dateType === 2 && { dateNeed, dateReturn }),
            image: imgData,
            creator: userId,
          }),
          User.findById(userId),
          // Populate community members, exclude current user & unsubscribe user
          // & only return email
          Community.findById(communityId).populate({
            path: "members",
            match: { _id: { $ne: userId } },
            select: "email isNotified fcmTokens",
          }),
        ]);

        if (creator && community) {
          // Save requestId & notificationId to community && requestId to creator
          community.requests.push(request);
          creator.requests.push(request);

          // Parse array of members object into array of emails if member is notified
          const emails = community.members
            // @ts-ignore
            .filter((member) => member.isNotified === true)
            // @ts-ignore
            .map((member) => member.email);

          // Save community & sent email to subscribed users
          await Promise.all([
            community.save(),
            creator.save(),
            process.env.NODE_ENV === "production" &&
              emails.length &&
              newRequestMail(
                userName,
                title,
                JSON.parse(imgData).secure_url,
                `${process.env.ORIGIN}/requests/${request._id}`,
                dateNeed,
                emails,
                `${userName} requested ${title} in your community.`
              ),
          ]);

          // Get a list of users that has FCM tokens
          const receivers = community.members
            // @ts-ignore
            .filter((member) => member.fcmTokens.length)
            .map((member) => ({
              // @ts-ignore
              _id: member._id,
              // @ts-ignore
              fcmTokens: member.fcmTokens,
            }));

          // Sent push notification
          pushNotification(
            {},
            `${userName} requested ${title} in the ${community.name} community`,
            receivers
          );

          return {
            ...request,
            creator: {
              _id: userId,
              name: userName,
            },
          };
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
    deleteRequest: async (
      _: unknown,
      { requestId }: { requestId: string },
      { user }: { user: UserContext }
    ): Promise<RequestDocument | null> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find request & currentUser
        const [request, currentUser] = await Promise.all([
          Request.findById(requestId),
          User.findById(user.userId),
        ]);

        if (request && currentUser) {
          // Throw error if user is not post creator
          if (request.creator.toString() !== user.userId) {
            throw new ForbiddenError("Unauthorized user");
          }

          // Destruct threads from request
          const { threads } = request;

          // Delete request, requestId from community & delete request threads
          await Promise.all([
            request.remove(),
            User.updateOne(
              { _id: user.userId },
              { $pull: { requests: requestId } }
            ),
            Community.updateMany(
              { _id: { $in: currentUser.communities } },
              {
                $pull: { requests: requestId },
              }
            ),
            Thread.deleteMany({ _id: { $in: threads } }),
          ]);

          return request;
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default requestsResolvers;
