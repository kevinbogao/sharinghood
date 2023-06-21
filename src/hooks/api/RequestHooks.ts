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
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TCreateRequestBody } from "../../lib/schema/requests";
import type { TCreateRequestResponse, TGetRequestsResponse } from "../../pages/api/requests";
import type { TGetRequestResponse } from "../../pages/api/requests/[id]";

export const useRequestQuery = (
  id: string,
  options?: Omit<UseQueryOptions<TGetRequestResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetRequestResponse, IInternalApiError> =>
  useQuery<TGetRequestResponse, IInternalApiError>(
    QueryKeys.Requests.request(id),
    async () => apiRequest<TGetRequestResponse>(`/requests/${id}`),
    options
  );

export const useRequestsQuery = (
  communityId: string,
  options?: Pick<UseInfiniteQueryOptions<TGetRequestsResponse, IInternalApiError>, "enabled">
): UseInfiniteQueryResult<TGetRequestsResponse, IInternalApiError> =>
  useInfiniteQuery<TGetRequestsResponse, IInternalApiError>({
    queryKey: QueryKeys.Requests.requests,
    queryFn: async ({ pageParam }) =>
      apiRequest<TGetRequestsResponse>(
        `/requests?community_id=${communityId}&skip=${pageParam?.skip ?? 0}&take=${
          appConfig.pagination.postDefaultTake
        }`
      ),
    getNextPageParam: ({ has_more }, allPages) => {
      const count = allPages.reduce((sum, { requests }) => sum + requests.length, 0);
      return has_more ? { skip: count } : undefined;
    },
    ...options,
  });

export const useCreateRequestMutation = (
  options?: UseMutationOptions<TCreateRequestResponse, IInternalApiError, TCreateRequestBody>
): UseMutationResult<TCreateRequestResponse, IInternalApiError, TCreateRequestBody> =>
  useMutation<TCreateRequestResponse, IInternalApiError, TCreateRequestBody>(
    async (body) => apiRequest<TCreateRequestResponse, TCreateRequestBody>("/requests", { method: "POST", body }),
    options
  );
