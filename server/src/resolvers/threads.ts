import { AuthenticationError } from "apollo-server";
import User, { UserDocument } from "../models/user";
import Post, { PostDocument } from "../models/post";
import Thread, { ThreadDocument } from "../models/thread";
import Request, { RequestDocument } from "../models/request";
import { UserContext } from "../types";
import pushNotification from "../utils/pushNotification";

interface ThreadInput {
  content: string;
  isPost: boolean;
  parentId: string;
  communityId: string;
  recipientId?: string;
}

const threadsResolvers = {
  Mutation: {
    createThread: async (
      _: unknown,
      {
        threadInput: { content, isPost, parentId, communityId, recipientId },
      }: { threadInput: ThreadInput },
      { user }: { user: UserContext }
    ): Promise<ThreadDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId } = user;

      try {
        let parent:
          | (PostDocument | null | undefined)
          | (RequestDocument | null | undefined);
        let recipient: UserDocument | null | undefined;

        // Create & save thread && get parent (post or request)
        const thread: ThreadDocument | null = await Thread.create({
          content,
          poster: userId,
          community: communityId,
        });

        if (isPost) parent = await Post.findById(parentId);
        else parent = await Request.findById(parentId);
        if (recipientId) recipient = await User.findById(recipientId);

        if (parent) {
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
        }

        return thread;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default threadsResolvers;
