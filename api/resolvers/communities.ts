import {
  AuthenticationError,
  UserInputError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import { Community, User } from "../entities";
import { Context, CreateCommunityInput } from "../../lib/types";

export interface CommunityNotificationCount extends Community {
  notificationCount: number;
}

const communityResolvers = {
  Query: {
    async findCommunity(
      _: unknown,
      { communityCode }: { communityCode: string },
      { connection }: Context
    ): Promise<Community | undefined> {
      return await connection
        .getRepository(Community)
        .createQueryBuilder("community")
        .where({ code: communityCode })
        .select([
          "community.id",
          "community.name",
          "community.code",
          "member.id",
          "member.imageUrl",
        ])
        .leftJoin("community.members", "member")
        .getOne();
    },
    async community(
      _: unknown,
      { communityId }: { communityId: string },
      { loader, user }: Context,
      info: IGraphQLToolsResolveInfo
    ) {
      if (!user) throw new AuthenticationError("Not Authenticated");
      return await loader
        .loadEntity(Community, "community")
        .where("community.id = :communityId", { communityId })
        .info(info)
        .loadOne();
    },
    async communities(
      _: unknown,
      __: unknown,
      { user, loader, redis }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<CommunityNotificationCount[]> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const userCommunities = await loader
        .loadEntity(Community, "community")
        .info(info)
        .ejectQueryBuilder((qb) =>
          qb
            .leftJoin("community.members", "user")
            .where("user.id = :id", { id: user.userId })
        )
        .loadMany();

      const communityIds = userCommunities.map((community) => community.id);

      const notificationCount = await redis.hmget(
        `notifications:${user.userId}`,
        communityIds
      );
      const communities = userCommunities.map((community, idx) => {
        return {
          ...community,
          notificationCount: notificationCount[idx]
            ? Number(notificationCount[idx])
            : 0,
        };
      });

      // @ts-ignore
      return communities;
    },
  },
  Mutation: {
    async createCommunity(
      { newUser }: { newUser?: User },
      {
        communityInput: { name, code },
      }: { communityInput: CreateCommunityInput },
      { user, connection }: Context
    ): Promise<Community> {
      const creator = newUser
        ? newUser
        : await connection
            .getRepository(User)
            .findOne({ where: { id: user?.userId } });
      if (!creator) throw new UserInputError("User not found");

      return await Community.create({
        name,
        code,
        creator,
        members: [creator],
      }).save();
    },
    async joinCommunity(
      _: unknown,
      { communityId }: { communityId: string },
      { user, connection }: Context
    ): Promise<Community> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [member, community] = await Promise.all([
        connection.getRepository(User).findOne({ where: { id: user?.userId } }),
        connection
          .getRepository(Community)
          .findOne({ where: { id: communityId }, relations: ["members"] }),
      ]);
      if (!member) throw new UserInputError("User not found");
      if (!community) throw new UserInputError("Community not found");

      community.members.push(member);
      return await connection.manager.save(community);
    },
  },
};

export default communityResolvers;
