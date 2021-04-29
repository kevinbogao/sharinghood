// @ts-nocheck
import { AuthenticationError } from "apollo-server";
import User from "../models/user";
import Post from "../models/post";
import Thread from "../models/thread";
import Request from "../models/request";
const pushNotification = require("../utils/pushNotification");

const threadsResolvers = {
  Mutation: {
    createThread: async (
      _,
      { threadInput: { content, isPost, parentId, communityId, recipientId } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId } = user;

      try {
        // Create & save thread && get parent (post or request)
        const [thread, parent, recipient] = await Promise.all([
          Thread.create({
            content,
            poster: userId,
            community: communityId,
          }),
          isPost ? Post.findById(parentId) : Request.findById(parentId),
          userId !== recipientId && User.findById(recipientId),
        ]);

        // Add threadId to post/request
        parent.threads.push(thread);
        await parent.save();

        // Send push notification to recipient if current user is not the owner
        if (recipient) {
          pushNotification(
            {},
            `${user.userName} commented your ${
              isPost ? "post" : "request"
            } of ${parent.title}`,
            [
              {
                _id: recipient._id,
                fcmTokens: recipient.fcmTokens,
              },
            ]
          );
        }

        return thread;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default threadsResolvers;
