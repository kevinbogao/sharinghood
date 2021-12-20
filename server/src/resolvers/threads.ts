import { ApolloError, AuthenticationError } from "apollo-server-koa";
import User, { UserDocument } from "../models/user";
import Post, { PostDocument } from "../models/post";
import Thread, { ThreadDocument } from "../models/thread";
import Request, { RequestDocument } from "../models/request";
import { UserTokenContext } from "../utils/authToken";
import pushNotification from "../utils/pushNotification";

interface ThreadInput {
  content: string;
  isPost: boolean;
  parentId: string;
  communityId: string;
  recipientId: string;
}

const threadsResolvers = {
  Mutation: {
    createThread: async (
      _: unknown,
      {
        threadInput: { content, isPost, parentId, communityId, recipientId },
      }: { threadInput: ThreadInput },
      { user }: { user: UserTokenContext }
    ): Promise<ThreadDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId } = user;

      try {
        // Declare top-level parent variable which could be post or request
        let parent: PostDocument | RequestDocument | null;

        // Create & save thread && get parent (post or request)
        const thread: ThreadDocument | null = await Thread.create({
          content,
          poster: userId,
          community: communityId,
        });

        // Find post if parent type is post
        if (isPost) {
          parent = await Post.findById(parentId);
          if (!parent) throw new ApolloError("Post not found");

          // Find request if parent type is not post
        } else {
          parent = await Request.findById(parentId);
          if (!parent) throw new ApolloError("Request not found");
        }

        // Add thread to parent's threads & save parent
        parent.threads.push(thread);
        await parent.save();

        // Find recipient
        const recipient: UserDocument | null = await User.findById(recipientId);

        // Sent push notification if recipient is found
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
        // @ts-ignore
        throw new Error(err);
      }
    },
  },
};

export default threadsResolvers;
