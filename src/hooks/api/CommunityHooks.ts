import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TCreateCommunityBody, TSearchCommunityQuery } from "../../lib/schema/communities";
import type { TCreateCommunityResponse, TGetCommunitiesResponse } from "../../pages/api/communities";
import type { TSearchCommunityResponse } from "../../pages/api/communities/search";

export const useCommunitiesQuery = (
  options?: Omit<UseQueryOptions<TGetCommunitiesResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetCommunitiesResponse, IInternalApiError> =>
  useQuery<TGetCommunitiesResponse, IInternalApiError>(
    QueryKeys.Communities.communities,
    async () => apiRequest<TGetCommunitiesResponse>("/communities"),
    options
  );

export const useSearchCommunityQuery = (
  code: TSearchCommunityQuery["code"],
  options?: Omit<UseQueryOptions<TSearchCommunityResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TSearchCommunityResponse, IInternalApiError> =>
  useQuery<TSearchCommunityResponse, IInternalApiError>(
    QueryKeys.Communities.searchCommunity(code),
    async () => apiRequest<TSearchCommunityResponse>(`/communities/search?code=${code}`),
    options
  );

export const useSearchCommunityMutation = (
  options?: UseMutationOptions<TSearchCommunityResponse, IInternalApiError, TSearchCommunityQuery>
): UseMutationResult<TSearchCommunityResponse, IInternalApiError, TSearchCommunityQuery> =>
  useMutation<TSearchCommunityResponse, IInternalApiError, TSearchCommunityQuery>(
    async ({ code }) => apiRequest<TSearchCommunityResponse, TSearchCommunityQuery>(`/communities/search?code=${code}`),
    options
  );

export const useCreateCommunityMutation = (
  options?: UseMutationOptions<TCreateCommunityResponse, IInternalApiError, TCreateCommunityBody>
): UseMutationResult<TCreateCommunityResponse, IInternalApiError, TCreateCommunityBody> =>
  useMutation<TCreateCommunityResponse, IInternalApiError, TCreateCommunityBody>(
    async (body) =>
      apiRequest<TCreateCommunityResponse, TCreateCommunityBody>("/communities", { method: "POST", body }),
    options
  );

export const useJoinCommunityMutation = (
  communityId: string,
  options?: UseMutationOptions<void, IInternalApiError>
): UseMutationResult<void, IInternalApiError, void> =>
  useMutation<never, IInternalApiError>(
    async () => apiRequest<never>(`/communities/${communityId}/join`, { method: "POST" }),
    options
  );
