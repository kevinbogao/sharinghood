import {
  ForbiddenError,
  UserInputError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import { User, Post, Request, Booking, Community } from "../entities";
import { Context } from "../../lib/types";

const activityResolvers = {
  Query: {
    async totalActivities(
      _: unknown,
      __: unknown,
      { user, connection }: Context
    ) {
      if (!user?.isAdmin) return new ForbiddenError("Forbidden");

      const [
        totalUsersCount,
        totalPostsCount,
        totalRequestsCount,
        totalBookingsCount,
        totalCommunitiesCount,
        communitiesActivities,
      ] = await Promise.all([
        connection.getRepository(User).count(),
        connection.getRepository(Post).count(),
        connection.getRepository(Request).count(),
        connection.getRepository(Booking).count(),
        connection.getRepository(Community).count(),
        connection
          .getRepository(Community)
          .createQueryBuilder("community")
          .leftJoin("community.posts", "post")
          .leftJoin("community.members", "member")
          .leftJoin("community.requests", "request")
          .leftJoin("community.bookings", "booking")
          .loadRelationCountAndMap("community.postsCount", "community.posts")
          .loadRelationCountAndMap(
            "community.membersCount",
            "community.members"
          )
          .loadRelationCountAndMap(
            "community.requestsCount",
            "community.requests"
          )
          .loadRelationCountAndMap(
            "community.bookingsCount",
            "community.bookings"
          )
          .getMany(),
      ]);

      return {
        totalUsersCount,
        totalPostsCount,
        totalRequestsCount,
        totalBookingsCount,
        totalCommunitiesCount,
        communitiesActivities,
      };
    },
    async communityActivities(
      _: unknown,
      { communityId }: { communityId: string },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ) {
      if (!user?.isAdmin) return new ForbiddenError("Forbidden");

      const communityActivities = await loader
        .loadEntity(Community, "community")
        .where("community.id = :id", { id: communityId })
        .info(info)
        .loadOne();

      if (!communityActivities) throw new UserInputError("Community not found");
      return communityActivities;
    },
  },
};

export default activityResolvers;
