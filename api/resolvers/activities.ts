import { ForbiddenError, IGraphQLToolsResolveInfo } from "apollo-server-micro";
import { User, Post, Request, Booking, Community } from "../entities";
import type { CommunityActivities, Context } from "../../lib/types";

export default {
  CommunityActivities: {
    async paginatedPosts(
      communityActivities: CommunityActivities,
      { offset, limit }: { offset: number; limit: number },
      { loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<{ posts: Post[]; hasMore: boolean; totalCount?: number }> {
      if (limit === 0) return { posts: [], hasMore: true };

      const [posts, totalCount] = await loader
        .loadEntity(Post, "post")
        .info(info, "posts")
        .ejectQueryBuilder((qb) =>
          qb
            .leftJoin("post.communities", "community")
            .where("community.id = :id", { id: communityActivities.id })
        )
        .order({ "post.createdAt": "DESC" })
        .paginate({ offset, limit })
        .loadPaginated();

      return { posts, hasMore: offset + limit < totalCount, totalCount };
    },
    async paginatedMembers(
      communityActivities: CommunityActivities,
      { offset, limit }: { offset: number; limit: number },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<{ users: User[]; hasMore: boolean; totalCount?: number }> {
      if (limit === 0) return { users: [], hasMore: true };

      const [users, totalCount] = await loader
        .loadEntity(User, "user")
        .info(info, "users")
        .ejectQueryBuilder((qb) =>
          qb
            .leftJoin("user.communities", "community")
            .where("community.id = :id", { id: communityActivities.id })
        )
        .order({ "user.createdAt": "DESC" })
        .paginate({ offset, limit })
        .context({ user })
        .loadPaginated();

      return { users, hasMore: offset + limit < totalCount, totalCount };
    },
    async paginatedRequests(
      communityActivities: CommunityActivities,
      { offset, limit }: { offset: number; limit: number },
      { loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<{ requests: Request[]; hasMore: boolean; totalCount?: number }> {
      if (limit === 0) return { requests: [], hasMore: true };

      const [requests, totalCount] = await loader
        .loadEntity(Request, "request")
        .info(info, "requests")
        .where("request.communityId = :communityId", {
          communityId: communityActivities.id,
        })
        .order({ "request.createdAt": "DESC" })
        .paginate({ offset, limit })
        .loadPaginated();

      return { requests, hasMore: offset + limit < totalCount, totalCount };
    },
    async paginatedBookings(
      communityActivities: CommunityActivities,
      { offset, limit }: { offset: number; limit: number },
      { loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<{ bookings: Booking[]; hasMore: boolean; totalCount?: number }> {
      if (limit === 0) return { bookings: [], hasMore: true };

      const [bookings, totalCount] = await loader
        .loadEntity(Booking, "booking")
        .info(info, "bookings")
        .where("booking.communityId = :communityId", {
          communityId: communityActivities.id,
        })
        .order({ "booking.createdAt": "DESC" })
        .paginate({ offset, limit })
        .loadPaginated();

      return { bookings, hasMore: offset + limit < totalCount, totalCount };
    },
  },
  Query: {
    async totalActivities(
      _: never,
      { offset, limit }: { offset: number; limit: number },
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
          .skip(offset)
          .take(limit)
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
      _: never,
      { communityId }: { communityId: string },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Community | undefined> {
      if (!user?.isAdmin) throw new ForbiddenError("Forbidden");

      return await loader
        .loadEntity(Community, "community")
        .where("community.id = :id", { id: communityId })
        .info(info)
        .loadOne();
    },
  },
};
