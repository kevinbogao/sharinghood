import {
  UserInputError,
  ForbiddenError,
  AuthenticationError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import { Connection } from "typeorm";
import notificationResolvers from "./notifications";
import { User, Post, Community, Booking, Notification } from "../entities";
import pushNotification from "../../lib/firebase";
import { upload } from "../../lib/image";
import { NotificationType } from "../../lib/enums";
import type { Context, PostInput, CreatePostInput } from "../../lib/types";

async function getPostByCreator(
  postId: string,
  userId: string,
  connection: Connection
): Promise<Post> {
  const post = await connection.getRepository(Post).findOne({
    where: { id: postId },
  });
  if (!post) throw new UserInputError("Post not found");
  if (post.creatorId !== userId) throw new ForbiddenError("Unauthorized user");
  return post;
}

const postResolvers = {
  Query: {
    async post(
      _: unknown,
      { postId }: { postId: string },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Post> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const post = await loader
        .loadEntity(Post, "post")
        .where("post.id = :id", { id: postId })
        .info(info)
        .loadOne();

      if (!post) throw new UserInputError("Post not found");
      return post;
    },
    async posts(
      _: unknown,
      { communityId }: { communityId: string },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Post[]> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const posts = await loader
        .loadEntity(Post, "post")
        .info(info)
        .ejectQueryBuilder((qb) =>
          qb
            .leftJoin("post.communities", "community")
            .where("community.id = :id", { id: communityId })
        )
        .order({ "post.createdAt": "DESC" })
        .loadMany();

      return posts;
    },
  },
  Mutation: {
    async createPost(
      _: unknown,
      {
        postInput: { title, desc, image, condition, isGiveaway, requesterId },
        communityId,
      }: { postInput: CreatePostInput; communityId: string },
      { user, connection, redis, loader }: Context
    ): Promise<Post> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const [creator, community] = await Promise.all([
        connection.getRepository(User).findOne({ where: { id: user.userId } }),
        connection
          .getRepository(Community)
          .createQueryBuilder("community")
          .where("community.id = :communityId", { communityId })
          .leftJoin("community.posts", "post")
          .leftJoin("community.members", "member")
          .leftJoin("member.tokens", "token")
          .select(["community.id", "post.id", "member.id", "token.firebase"])
          .getOne(),
      ]);
      if (!creator) throw new UserInputError("user not found");
      if (!community) throw new UserInputError("Community not found");

      const imageUrl = await upload(image);

      const post = await connection
        .getRepository(Post)
        .create({
          title,
          desc,
          imageUrl,
          condition,
          isGiveaway,
          creator,
        })
        .save();

      community.posts.push(post);
      await connection.manager.save(community);

      const receivers = community.members.filter(
        (member) => member.id !== user.userId
      );
      pushNotification(
        {},
        `${user.userName} shared ${title} in the ${community.name} community`,
        receivers
      );

      if (requesterId) {
        await notificationResolvers.Mutation.createNotification(
          {},
          {
            notificationInput: {
              type: NotificationType.REQUEST,
              postId: post.id,
              recipientId: requesterId,
              communityId,
            },
          },
          { user, connection, redis, loader }
        );

        const requester = community.members.find(
          (member) => member.id === requesterId
        );

        pushNotification(
          { communityId },
          `${user.userName} shared ${title} in the ${community.name} community for your request`,
          [requester!]
        );
      }

      return post;
    },
    async updatePost(
      _: unknown,
      {
        postInput: { postId, title, desc, image, condition, isGiveaway },
      }: { postInput: PostInput },
      { user, connection }: Context
    ): Promise<Post> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const post = await getPostByCreator(postId, user.userId, connection);
      const imageUrl = image && (await upload(image));
      if (title) post.title = title;
      if (desc) post.desc = desc;
      if (imageUrl) post.imageUrl = imageUrl;
      if (condition) post.condition = condition;
      if (isGiveaway !== undefined) post.isGiveaway = isGiveaway;

      return await connection.manager.save(post);
    },
    async deletePost(
      _: unknown,
      { postId }: { postId: string },
      { user, connection }: Context
    ): Promise<boolean> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const post = await getPostByCreator(postId, user.userId, connection);
      await connection.getRepository(Post).remove(post);
      return true;
    },
    async inactivatePost(
      _: unknown,
      { postId }: { postId: string },
      { user, connection }: Context
    ): Promise<boolean> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const post = await connection
        .getRepository(Post)
        .findOne({ where: { id: postId }, relations: ["communities"] });
      if (!post) throw new UserInputError("Post not found");
      if (post.creatorId !== user.userId)
        throw new ForbiddenError("Unauthorized user");

      const bookingRepository = connection.getRepository(Booking);
      const notificationRepository = connection.getRepository(Notification);
      const [bookings, notifications] = await Promise.all([
        connection.getRepository(Booking).find({ where: { postId } }),
        connection.getRepository(Notification).find({ where: { postId } }),
      ]);

      post.communities = [];
      await Promise.all([
        connection.manager.save(post),
        bookingRepository.remove(bookings),
        notificationRepository.remove(notifications),
      ]);

      return true;
    },
    async addPostToCommunity(
      _: unknown,
      { postId, communityId }: { postId: string; communityId: string },
      { user, connection }: Context
    ): Promise<Community> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const post = await getPostByCreator(postId, user.userId, connection);
      const community = await connection
        .getRepository(Community)
        .findOne({ where: { id: communityId }, relations: ["posts"] });
      if (!community) throw new UserInputError("Community not found");
      community.posts.push(post);
      return await connection.manager.save(community);
    },
  },
};

export default postResolvers;
