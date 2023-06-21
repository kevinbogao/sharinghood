import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { appConfig } from "../../lib/client/appConfig";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TCreateThreadBody } from "../../lib/schema/threads";
import type { TCreateThreadResponse, TGetThreadsResponse } from "../../pages/api/threads";

interface IUseThreadsQueryArgs {
  communityId: string;
  postId?: string;
  requestId?: string;
}

export const useThreadsQuery = (
  { communityId, postId, requestId }: IUseThreadsQueryArgs,
  options?: Omit<UseInfiniteQueryOptions<TGetThreadsResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseInfiniteQueryResult<TGetThreadsResponse, IInternalApiError> =>
  useInfiniteQuery<TGetThreadsResponse, IInternalApiError>({
    queryKey: QueryKeys.Threads.threads(communityId, postId, requestId),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        community_id: communityId,
        ...(postId && { post_id: postId }),
        ...(requestId && { request_id: requestId }),
        skip: `${pageParam?.skip ?? 0}`,
        take: `${appConfig.pagination.postDefaultTake}`,
      });

      return apiRequest<TGetThreadsResponse, IInternalApiError>(`/threads?${params.toString()}`);
    },
    getNextPageParam: ({ has_more }, allPages) => {
      const count = allPages.reduce((sum, { threads }) => sum + threads.length, 0);
      return has_more ? { skip: count } : undefined;
    },
    ...options,
  });

export const useCreateThreadMutation = (
  options?: UseMutationOptions<TCreateThreadResponse, IInternalApiError, TCreateThreadBody>
): UseMutationResult<TCreateThreadResponse, IInternalApiError, TCreateThreadBody> =>
  useMutation<TCreateThreadResponse, IInternalApiError, TCreateThreadBody>(
    async (body) => apiRequest<TCreateThreadResponse, TCreateThreadBody>("/threads", { method: "POST", body }),
    {
      onSuccess: ({ thread }) => {
        const queryKeys = QueryKeys.Threads.threads(
          thread.community_id,
          thread.post_id ?? undefined,
          thread.request_id ?? undefined
        );
        queryClient.setQueryData<InfiniteData<TGetThreadsResponse>>(queryKeys, (prev) => {
          prev?.pages[0]?.threads.unshift(thread);
          return prev;
        });
      },
      ...options,
    }
  );
