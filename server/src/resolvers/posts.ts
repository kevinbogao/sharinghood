import { AuthenticationError, ForbiddenError } from "apollo-server";
import { Types } from "mongoose";
import User, { UserDocument } from "../models/user";
import Post, { PostDocument } from "../models/post";
import Thread, { ThreadDocument } from "../models/thread";
import Booking, { BookingDocument } from "../models/booking";
import Message from "../models/message";
import Community, { CommunityDocument } from "../models/community";
import Notification, { NotificationDocument } from "../models/notification";
import { UserContext } from "../types";
import uploadImg from "../utils/uploadImg";
import pushNotification from "../utils/pushNotification";

interface PostInput {
  postId: string;
  title: string;
  desc: string;
  image: string;
  condition: number;
  isGiveaway: boolean;
  requesterId: string;
}

const postsResolvers = {
  Query: {
    post: async (
      _: unknown,
      { postId }: { postId: any },
      { user }: { user: UserContext }
    ): Promise<PostDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get post && lookup creator & threads
        const post: Array<PostDocument> = await Post.aggregate([
          {
            $match: { _id: Types.ObjectId(postId) },
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
              let: { threads: "$threads" },
              pipeline: [
                {
                  $match: { $expr: { $in: ["$_id", "$$threads"] } },
                },
              ],
              as: "threads",
            },
          },
        ]);

        return post[0];
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    posts: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: UserContext }
    ): Promise<Array<PostDocument | Types.ObjectId>> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get all posts from given community
        const communityPosts: Array<CommunityDocument> = await Community.aggregate(
          [
            {
              $match: { _id: Types.ObjectId(communityId) },
            },
            {
              $lookup: {
                from: "posts",
                let: { posts: "$posts" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$posts"] } } },
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
                as: "posts",
              },
            },
            {
              $project: { posts: 1 }, // return posts array only
            },
          ]
        );

        return communityPosts[0].posts;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createPost: async (
      _: unknown,
      {
        postInput: { title, desc, image, condition, isGiveaway, requesterId },
        communityId,
      }: { postInput: PostInput; communityId: string },
      { user, redis }: { user: UserContext; redis: any }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId, userName }: { userId: string; userName: string } = user;

      try {
        // Upload image
        const imgData: string = await uploadImg(image);

        // Get post & post creator
        const post: PostDocument | null = await Post.create({
          desc,
          title,
          condition,
          isGiveaway,
          image: imgData,
          creator: userId,
        });
        const creator: UserDocument | null = await User.findById(userId);

        // Only save to community if communityId is given, i.e user is
        // uploading the post to a specific community
        if (communityId) {
          const community: CommunityDocument | null = await Community.findById(
            communityId
          ).populate({
            path: "members",
            match: { _id: { $ne: userId } },
            select: "fcmTokens",
          });

          if (community) {
            // Add post to community
            community.posts.push(post);

            // Get a list of users that has FCM tokens
            const receivers = community.members
              .filter((member: any) => member.fcmTokens.length)
              .map((member: any) => ({
                _id: member._id,
                fcmTokens: member.fcmTokens,
              }));

            // Sent push notification
            pushNotification(
              {},
              `${userName} shared ${title} in the ${community.name} community`,
              receivers
            );

            // Create notification if requesterId is given
            if (requesterId) {
              const requester: UserDocument | null = await User.findById(
                requesterId
              );

              if (requester) {
                const notification: NotificationDocument = await Notification.create(
                  {
                    ofType: 2,
                    post: post._id,
                    participants: [requesterId, user.userId],
                    isRead: {
                      [requesterId]: false,
                      [user.userId]: false,
                    },
                    community: communityId,
                  }
                );

                pushNotification(
                  {},
                  `${userName} shared ${title} in the ${community.name} community for your request`,
                  [
                    {
                      _id: requester._id,
                      fcmTokens: requester.fcmTokens,
                    },
                  ]
                );

                // Add notification to requester
                requester.notifications.push(notification);

                // Save requester & set communityId key to notifications:userId hash in redis
                await Promise.all([
                  requester.save(),
                  redis.hset(
                    `notifications:${requesterId}`,
                    `${communityId}`,
                    true
                  ),
                ]);
              }
            }

            if (creator) {
              creator.posts.push(post);
              await Promise.all([community.save(), creator.save()]);

              return {
                ...post,
                creator: {
                  _id: userId,
                  name: userName,
                },
              };
            }
          }
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
    updatePost: async (
      _: unknown,
      {
        postInput: { postId, title, desc, image, condition },
      }: { postInput: PostInput },
      { user }: { user: UserContext }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find post by id
        const post: PostDocument | null = await Post.findById(postId);

        if (post) {
          // Throw error if user is not creator
          if (post.creator.toString() !== user.userId) {
            throw new ForbiddenError("Unauthorized user");
          }

          // Upload image if it exists
          let imgData: string | undefined;
          if (image) imgData = await uploadImg(image);

          // Conditionally update post
          if (title) post.title = title;
          if (desc) post.desc = desc;
          if (image && imgData) post.image = imgData;
          if (condition) post.condition = condition;

          // Save & return post
          const updatedPost = await post.save();
          return updatedPost;
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
    inactivatePost: async (
      _: unknown,
      { postId }: { postId: string },
      { user }: { user: UserContext }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get user & post
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        ).lean();
        const post: PostDocument | null = await Post.findById(postId).lean();

        if (post && currentUser) {
          // Throw error if user is not post creator
          if (post.creator !== currentUser._id) {
            throw new ForbiddenError("Unauthorized user");
          }

          // Find user's communities and remove post from
          // all communities' posts array
          await Community.updateMany(
            {
              _id: { $in: currentUser.communities },
            },
            {
              $pull: { posts: postId },
            }
          );

          return true;
        }

        return false;
      } catch (err) {
        throw new Error(err);
      }
    },
    deletePost: async (
      _: unknown,
      { postId }: { postId: any },
      { user }: { user: UserContext }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Find post & currentUser
        const post: PostDocument | null = await Post.findById(postId);
        const currentUser: UserDocument | null = await User.findById(
          user.userId
        );

        if (post && currentUser) {
          // Throw error if user is not post creator
          if (post.creator.toString() !== user.userId) {
            throw new ForbiddenError("Unauthorized user");
          }

          // Save thread ids array
          const {
            threads,
            bookings,
          }: {
            threads: Array<Types.ObjectId | ThreadDocument>;
            bookings: Array<Types.ObjectId | BookingDocument>;
          } = post;

          // Get all notifications that is related to post's bookings or
          // the post itself
          const notifications: Array<NotificationDocument> = await Notification.find(
            {
              $or: [{ booking: { $in: bookings } }, { post: postId }],
            }
          );
          // Get a list to notifications' messages ids
          const messages = notifications
            .map((notification) => notification.messages)
            .flat(1);

          // Get a list of notifications ids
          const notificationsIds = notifications.map(
            (notification) => notification._id
          );

          // Create an object of invalid notifications with user id as key
          let invalidUserNotifications = {};
          notifications.forEach((notification: any) => {
            notification.participants.forEach((participant: any) => {
              if (participant in invalidUserNotifications) {
                // @ts-ignore
                invalidUserNotifications[participant].push(notification._id);
              } else {
                invalidUserNotifications = {
                  ...invalidUserNotifications,
                  [participant]: [notification._id],
                };
              }
            });
          });

          // Delete post, postId from community && delete post threads,
          // delete bookings & post related notifications & subsequent messages
          // && delete all notifications' ids from users
          await Promise.all([
            post.remove(),
            Community.updateMany(
              { _id: { $in: currentUser.communities } },
              { $pull: { posts: postId } }
            ),
            User.updateOne({ _id: user.userId }, { $pull: { posts: postId } }),
            Thread.deleteMany({ _id: { $in: threads } }),
            Booking.deleteMany({ _id: { $in: bookings } }),
            Message.deleteMany({ _id: { $in: messages } }),
            Notification.deleteMany({ _id: { $in: notificationsIds } }),
            Object.keys(invalidUserNotifications).map((userId) =>
              Promise.resolve(
                User.updateOne(
                  { _id: userId },
                  {
                    $pull: {
                      // @ts-ignore
                      notifications: { $in: invalidUserNotifications[userId] },
                    },
                  }
                )
              )
            ),
          ]);

          return post;
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
    addPostToCommunity: async (
      _: unknown,
      { postId, communityId }: { postId: Types.ObjectId; communityId: any },
      { user }: { user: UserContext }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        // Get community by id and add post if to the community's
        // posts array; return community
        const post: PostDocument | null = await Post.findById(postId);
        const community: CommunityDocument | null = await Community.findById(
          communityId
        );

        // Throw error if user is not post creator
        if (post && community) {
          if (post.creator.toString() !== user.userId) {
            throw new ForbiddenError("Unauthorized user");
          }

          // Add post to community & save community
          community.posts.push(postId);
          await community.save();

          return community;
        }

        return null;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default postsResolvers;
