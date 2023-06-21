import type {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { appConfig } from "../../lib/client/appConfig";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TAddPostToCommunityBody, TCreatePostBody, TUpdatePostBody } from "../../lib/schema/posts";
import type { TCreatePostResponse, TGetPostsResponse } from "../../pages/api/posts";
import type { TGetPostResponse, TUpdatePostResponse } from "../../pages/api/posts/[id]";
import type { TAddPostToCommunityResponse, TGetPostCommunitiesResponse } from "../../pages/api/posts/[id]/communities";

export const usePostQuery = (
  id: string,
  options?: Omit<UseQueryOptions<TGetPostResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetPostResponse, IInternalApiError> =>
  useQuery<TGetPostResponse, IInternalApiError>(
    QueryKeys.Posts.post(id),
    async () => apiRequest<TGetPostResponse>(`/posts/${id}`),
    options
  );

export const usePostCommunitiesQuery = (
  id: string,
  options?: Omit<UseQueryOptions<TGetPostCommunitiesResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetPostCommunitiesResponse, IInternalApiError> =>
  useQuery<TGetPostCommunitiesResponse, IInternalApiError>(
    QueryKeys.Posts.postCommunities(id),
    async () => apiRequest<TGetPostCommunitiesResponse>(`/posts/${id}/communities`),
    options
  );

export const usePostsQuery = (
  communityId: string,
  options?: Pick<UseInfiniteQueryOptions<TGetPostsResponse, IInternalApiError>, "enabled">
): UseInfiniteQueryResult<TGetPostsResponse, IInternalApiError> =>
  useInfiniteQuery<TGetPostsResponse, IInternalApiError>({
    queryKey: QueryKeys.Posts.posts(communityId),
    queryFn: async ({ pageParam }) =>
      apiRequest<TGetPostsResponse>(
        `/posts?community_id=${communityId}&skip=${pageParam?.skip ?? 0}&take=${appConfig.pagination.postDefaultTake}`
      ),
    getNextPageParam: ({ has_more }, allPages) => {
      const count = allPages.reduce((sum, { posts }) => sum + posts.length, 0);
      return has_more ? { skip: count } : undefined;
    },
    ...options,
  });

export const useCreatePostMutation = (
  options?: UseMutationOptions<TCreatePostResponse, IInternalApiError, TCreatePostBody>
): UseMutationResult<TCreatePostResponse, IInternalApiError, TCreatePostBody> =>
  useMutation<TCreatePostResponse, IInternalApiError, TCreatePostBody>(
    async (body) => apiRequest<TCreatePostResponse, TCreatePostBody>("/posts", { method: "POST", body }),
    options
  );

export const useUpdatePostMutation = (
  postId: string,
  options?: UseMutationOptions<TUpdatePostResponse, IInternalApiError, TUpdatePostBody>
): UseMutationResult<TUpdatePostResponse, IInternalApiError, TUpdatePostBody> =>
  useMutation<TUpdatePostResponse, IInternalApiError, TUpdatePostBody>(
    async (body) => apiRequest<TUpdatePostResponse, TUpdatePostBody>(`/posts/${postId}`, { method: "PUT", body }),
    options
  );

export const useAddPostToCommunityMutation = (
  postId: string,
  options?: Omit<
    UseMutationOptions<TAddPostToCommunityResponse, IInternalApiError, TAddPostToCommunityBody>,
    "onSettled"
  >
): UseMutationResult<TAddPostToCommunityResponse, IInternalApiError, TAddPostToCommunityBody> =>
  useMutation<TAddPostToCommunityResponse, IInternalApiError, TAddPostToCommunityBody>(
    async (body) =>
      apiRequest<TAddPostToCommunityResponse, TAddPostToCommunityBody>(`/posts/${postId}/communities`, {
        method: "PUT",
        body,
      }),
    {
      ...options,
      onSettled: async () => queryClient.invalidateQueries(QueryKeys.Posts.postCommunities(postId)),
    }
  );
