import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TGetAdminStatsResponse } from "../../pages/api/admin/stats";
import type { TGetCommunityStatsResponse } from "../../pages/api/admin/stats/[id]";
import type { TGetCommunityBookingsResponse } from "../../pages/api/admin/stats/[id]/bookings";
import type { TGetCommunityPostsResponse } from "../../pages/api/admin/stats/[id]/posts";
import type { TGetCommunityRequestsResponse } from "../../pages/api/admin/stats/[id]/requests";
import type { TGetCommunityUsersResponse } from "../../pages/api/admin/stats/[id]/users";
import type { TGetAdminCommunitiesResponse } from "../../pages/api/admin/stats/communities";

export const useAdminStatsQuery = (
  options?: Omit<UseQueryOptions<TGetAdminStatsResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetAdminStatsResponse, IInternalApiError> =>
  useQuery<TGetAdminStatsResponse, IInternalApiError>(
    QueryKeys.Admin.stats,
    async () => apiRequest<TGetAdminStatsResponse>("/admin/stats"),
    options
  );

export const useAdminCommunitiesQuery = (
  options?: Omit<UseQueryOptions<TGetAdminCommunitiesResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetAdminCommunitiesResponse, IInternalApiError> =>
  useQuery<TGetAdminCommunitiesResponse, IInternalApiError>(
    QueryKeys.Admin.communities,
    async () => apiRequest<TGetAdminCommunitiesResponse>("/admin/stats/communities"),
    options
  );

export const useCommunityStatsQuery = (
  communityId: string,
  options?: Omit<UseQueryOptions<TGetCommunityStatsResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetCommunityStatsResponse, IInternalApiError> =>
  useQuery<TGetCommunityStatsResponse, IInternalApiError>(
    QueryKeys.Admin.communityStats(communityId),
    async () => apiRequest<TGetCommunityStatsResponse>(`/admin/stats/${communityId}`),
    options
  );

export const useCommunityUsersQuery = (
  communityId: string,
  options?: Omit<UseQueryOptions<TGetCommunityUsersResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetCommunityUsersResponse, IInternalApiError> =>
  useQuery<TGetCommunityUsersResponse, IInternalApiError>(
    QueryKeys.Admin.communityUsers(communityId),
    async () => apiRequest<TGetCommunityUsersResponse>(`/admin/stats/${communityId}/users`),
    options
  );

export const useCommunityPostsQuery = (
  communityId: string,
  options?: Omit<UseQueryOptions<TGetCommunityPostsResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetCommunityPostsResponse, IInternalApiError> =>
  useQuery<TGetCommunityPostsResponse, IInternalApiError>(
    QueryKeys.Admin.communityPosts(communityId),
    async () => apiRequest<TGetCommunityPostsResponse>(`/admin/stats/${communityId}/posts`),
    options
  );

export const useCommunityRequestsQuery = (
  communityId: string,
  options?: Omit<UseQueryOptions<TGetCommunityRequestsResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetCommunityRequestsResponse, IInternalApiError> =>
  useQuery<TGetCommunityRequestsResponse, IInternalApiError>(
    QueryKeys.Admin.communityRequests(communityId),
    async () => apiRequest<TGetCommunityRequestsResponse>(`/admin/stats/${communityId}/requests`),
    options
  );

export const useCommunityBookingsQuery = (
  communityId: string,
  options?: Omit<UseQueryOptions<TGetCommunityBookingsResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetCommunityBookingsResponse, IInternalApiError> =>
  useQuery<TGetCommunityBookingsResponse, IInternalApiError>(
    QueryKeys.Admin.communityBookings(communityId),
    async () => apiRequest<TGetCommunityBookingsResponse>(`/admin/stats/${communityId}/bookings`),
    options
  );
