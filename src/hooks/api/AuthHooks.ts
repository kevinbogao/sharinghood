import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TLoginBody, TResetPasswordBody, TSetPasswordBody } from "../../lib/schema/auth";
import type { TGetSessionResponse } from "../../pages/api/auth/session";

export const useSessionQuery = (
  options?: Omit<UseQueryOptions<TGetSessionResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetSessionResponse, IInternalApiError> =>
  useQuery<TGetSessionResponse, IInternalApiError>(
    QueryKeys.Auth.session,
    async () => apiRequest<TGetSessionResponse>("/auth/session"),
    options
  );

export const useResetPasswordCodeQuery = (
  code: string,
  options?: Omit<UseQueryOptions<never, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<never, IInternalApiError> =>
  useQuery<never, IInternalApiError>(
    QueryKeys.Auth.resetPasswordCode(code),
    async () => apiRequest<never>(`/auth/password/reset?code=${code}`),
    options
  );

export const useLoginMutation = (
  options?: Omit<UseMutationOptions<never, IInternalApiError, TLoginBody>, "onSettled">
): UseMutationResult<never, IInternalApiError, TLoginBody> =>
  useMutation(async (body) => apiRequest<never, TLoginBody>("/auth/login", { method: "POST", body }), {
    onSettled: async () => queryClient.invalidateQueries(QueryKeys.Auth.session),
    ...options,
  });

export const useLogoutMutation = (
  options?: Omit<UseMutationOptions<void, IInternalApiError>, "onSettled">
): UseMutationResult<void, IInternalApiError, void> =>
  useMutation(async () => apiRequest<never>("/auth/logout", { method: "POST" }), {
    onSettled: () => queryClient.setQueryData<TGetSessionResponse>(QueryKeys.Auth.session, { user: null }),
    ...options,
  });

export const useResetPasswordMutation = (
  options?: Omit<UseMutationOptions<never, IInternalApiError, TResetPasswordBody>, "onSettled">
): UseMutationResult<never, IInternalApiError, TResetPasswordBody> =>
  useMutation(
    async (body) => apiRequest<never, TResetPasswordBody>("/auth/password/reset", { method: "POST", body }),
    options
  );

export const useSetPasswordMutation = (
  options?: Omit<UseMutationOptions<never, IInternalApiError, TSetPasswordBody>, "onSettled">
): UseMutationResult<never, IInternalApiError, TSetPasswordBody> =>
  useMutation(
    async (body) => apiRequest<never, TSetPasswordBody>("/auth/password/reset", { method: "PUT", body }),
    options
  );
