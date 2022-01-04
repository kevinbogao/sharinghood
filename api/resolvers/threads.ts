import { AuthenticationError, UserInputError } from "apollo-server-micro";
import { User, Post, Request, Community, Thread } from "../entities";
import pushNotification from "../../lib/firebase";
import type { Context, CreateThreadInput } from "../../lib/types";

const threadResolvers = {
  Mutation: {
    async createThread(
      _: never,
      {
        threadInput: { content, isPost, parentId, communityId, recipientId },
      }: { threadInput: CreateThreadInput },
      { user, connection }: Context
    ): Promise<Thread> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const [creator, receiver, community, parent] = await Promise.all([
        connection.getRepository(User).findOne({
          where: { id: user.userId },
        }),
        connection.getRepository(User).findOne({
          where: { id: recipientId },
          relations: ["tokens"],
        }),
        connection.getRepository(Community).findOne({
          where: { id: communityId },
        }),
        isPost
          ? connection.getRepository(Post).findOne({
              where: { id: parentId },
            })
          : connection.getRepository(Request).findOne({
              where: { id: parentId },
            }),
      ]);

      if (!creator) throw new UserInputError("User not found");
      if (!community) throw new UserInputError("Community not found");
      if (!parent)
        throw new UserInputError(`${isPost ? "Post" : "Request"} not found`);

      const thread = new Thread();
      thread.content = content;
      thread.creator = creator;
      thread.community = community;
      if (isPost) thread.post = <Post>parent;
      else thread.request = <Request>parent;

      pushNotification(
        {},
        `${user.userName} commented your ${isPost ? "post" : "request"} of ${
          parent.title
        }`,
        [receiver!]
      );

      return await connection.manager.save(thread);
    },
  },
};

export default threadResolvers;
