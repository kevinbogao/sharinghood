import {
  ApolloError,
  ForbiddenError,
  AuthenticationError,
} from "apollo-server-koa";
import moment from "moment";
import { Types } from "mongoose";
import User, { UserDocument } from "../models/user";
import Thread from "../models/thread";
import Request, { RequestDocument } from "../models/request";
import Community, { CommunityDocument } from "../models/community";
import uploadImg from "../utils/uploadImg";
import { UserTokenContext } from "../utils/authToken";
import pushNotification from "../utils/pushNotification";
import newRequestMail from "../utils/sendMail/newRequestMail";

interface RequestInput {
  title: string;
  desc: string;
  image: string;
  dateType: number;
  dateNeed?: Date;
  dateReturn?: Date;
}

interface CreateRequestRes extends Omit<RequestDocument, "creator"> {
  creator: {
    _id: Types.ObjectId;
    name: string;
  };
}

const requestsResolvers = {
  Query: {
    request: async (
      _: unknown,
      { requestId }: { requestId: string },
      { user }: { user: UserTokenContext }
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
      { user }: { user: UserTokenContext }
    ): Promise<Array<RequestDocument | Types.ObjectId>> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get all requests from given community
        const communityRequests: Array<CommunityDocument> =
          await Community.aggregate([
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
          ]);

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
      { user }: { user: UserTokenContext }
    ): Promise<CreateRequestRes> => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId, userName }: { userId: string; userName: string } = user;

      try {
        // Upload image to Cloudinary
        const imgData: string = await uploadImg(image);

        // Find current user
        const creator: UserDocument | null = await User.findById(userId);
        if (!creator) throw new ApolloError("Creator not found");

        // Find target community;
        const community: CommunityDocument | null = await Community.findById(
          communityId
        ).populate({
          path: "members",
          match: { _id: { $ne: userId } },
          select: "email isNotified fcmTokens",
        });
        if (!community) throw new ApolloError("Community not found");

        const request: RequestDocument = await Request.create({
          title,
          desc,
          dateType,
          ...(dateType === 2 && { dateNeed, dateReturn }),
          image: imgData,
          creator: userId,
        });

        // Save requestId & notificationId to community && requestId to creator
        community.requests.push(request);
        creator.requests.push(request);

        // Parse array of members object into array of Recipients if member
        // is notified
        const recipients = (community.members as Array<UserDocument>)
          .filter((member: UserDocument) => member.isNotified === true)
          .map((member: UserDocument) => ({
            _id: member._id as string,
            email: member.email,
          }));

        // Save community & creator
        await Promise.all([community.save(), creator.save()]);

        // Sent email to subscribed users
        if (process.env.NODE_ENV === "production" && recipients.length) {
          await newRequestMail({
            userName,
            itemName: title,
            itemImageUrl: JSON.parse(imgData).secure_url,
            itemUrl: `${process.env.ORIGIN}/requests/${request._id}`,
            ...(dateNeed && {
              dateNeed: dateNeed && moment(+request.dateNeed).format("MMM DD"),
            }),
            recipients,
            subject: `${userName} requested ${title} in your community.`,
            text: "",
          });
        }

        // Get a list of users that has FCM tokens
        const receivers = (community.members as Array<UserDocument>)
          .filter((member: UserDocument) => member.fcmTokens.length)
          .map((member: UserDocument) => ({
            _id: member._id,
            fcmTokens: member.fcmTokens,
          }));

        // Sent push notification
        pushNotification(
          {},
          `${userName} requested ${title} in the ${community.name} community`,
          receivers
        );

        return {
          // @ts-ignore
          ...request._doc,
          creator: {
            _id: userId,
            name: userName,
          },
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    deleteRequest: async (
      _: unknown,
      { requestId }: { requestId: string },
      { user }: { user: UserTokenContext }
    ): Promise<RequestDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find request
        const request: RequestDocument | null = await Request.findById(
          requestId
        );
        if (!request) throw new ApolloError("Request not found");

        // Find currentUser
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        );
        if (!currentUser) throw new ForbiddenError("Unauthorized user");

        // Throw error if user is not post creator
        if (request.creator.toString() !== user.userId.toString()) {
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
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default requestsResolvers;
