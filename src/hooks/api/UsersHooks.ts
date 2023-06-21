import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type {
  TCreateUseQuery,
  TCreateUserWithCommunityBody,
  TUnsubscribeUserQuerySchema,
  TUpdateMeBody,
} from "../../lib/schema/users";
import type { TGetUsersResponse } from "../../pages/api/users";
import type { TMeResponse } from "../../pages/api/users/me";

export const useUsersQuery = (
  communityId: string,
  options?: Omit<UseQueryOptions<TGetUsersResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetUsersResponse, IInternalApiError> =>
  useQuery<TGetUsersResponse, IInternalApiError>(
    QueryKeys.Users.users(communityId),
    async () => apiRequest<TGetUsersResponse>(`/users?community_id=${communityId}`),
    options
  );

export const useMeQuery = (
  options?: Omit<UseQueryOptions<TMeResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TMeResponse, IInternalApiError> =>
  useQuery<TMeResponse, IInternalApiError>(
    QueryKeys.Users.me,
    async () => apiRequest<TMeResponse>("/users/me"),
    options
  );

export const useUnsubscribeUserQuerySchema = (
  id: TUnsubscribeUserQuerySchema["id"],
  token: TUnsubscribeUserQuerySchema["token"],
  options?: Omit<UseQueryOptions<never, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<never, IInternalApiError> =>
  useQuery<never, IInternalApiError>(
    QueryKeys.Users.unsubscribe(id, token),
    async () => apiRequest<never>(`/users/unsubscribe?id=${id}&token=${token}`, { method: "POST" }),
    options
  );

export const useUpdateMeMutation = (
  options?: UseMutationOptions<TMeResponse, IInternalApiError, TUpdateMeBody>
): UseMutationResult<TMeResponse, IInternalApiError, TUpdateMeBody> =>
  useMutation<TMeResponse, IInternalApiError, TUpdateMeBody>(
    async (body) => apiRequest<TMeResponse, TUpdateMeBody>("/users/me", { method: "PUT", body }),
    options
  );

type TCreateUserVariables = TCreateUseQuery & TCreateUserWithCommunityBody;
export const useCreateUserMutation = (
  options?: UseMutationOptions<void, IInternalApiError, TCreateUserVariables>
): UseMutationResult<void, IInternalApiError, TCreateUserVariables> =>
  useMutation<never, IInternalApiError, TCreateUserVariables>(async ({ community_id, ...body }) => {
    const url = community_id ? `/users/create?community_id=${community_id}` : "/users/create";
    return apiRequest<never, TCreateUserWithCommunityBody>(url, { method: "POST", body });
  }, options);
