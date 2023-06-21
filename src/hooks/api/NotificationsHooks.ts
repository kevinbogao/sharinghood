import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TCreateChatNotificationBody, TGetNotificationsQuery } from "../../lib/schema/notifications";
import type { TCreatChatNotificationResponse, TGetNotificationsResponse } from "../../pages/api/notifications";
import type { TGetNotificationResponse } from "../../pages/api/notifications/[id]";

export const useNotificationQuery = (
  id: string,
  options?: Omit<UseQueryOptions<TGetNotificationResponse, IInternalApiError>, "onSuccess" | "queryFn" | "queryKey">
): UseQueryResult<TGetNotificationResponse, IInternalApiError> =>
  useQuery<TGetNotificationResponse, IInternalApiError>(
    QueryKeys.Notifications.notification(id),
    async () => apiRequest<TGetNotificationResponse>(`/notifications/${id}`),
    {
      onSuccess: async ({ notification }) => {
        await queryClient.invalidateQueries(QueryKeys.Notifications.notifications(notification.community_id));
      },
      ...options,
    }
  );

export const useNotificationsQuery = (
  // TODO: parse query automatically
  communityId: TGetNotificationsQuery["community_id"],
  options?: Omit<UseQueryOptions<TGetNotificationsResponse, IInternalApiError>, "onSuccess" | "queryFn" | "queryKey">
): UseQueryResult<TGetNotificationsResponse, IInternalApiError> =>
  useQuery<TGetNotificationsResponse, IInternalApiError>(
    QueryKeys.Notifications.notifications(communityId),
    async () => apiRequest<TGetNotificationsResponse>(`/notifications?community_id=${communityId}`),
    options
  );

export const useCreateNotificationMutation = (
  options?: UseMutationOptions<TCreatChatNotificationResponse, IInternalApiError, TCreateChatNotificationBody>
): UseMutationResult<TCreatChatNotificationResponse, IInternalApiError, TCreateChatNotificationBody> =>
  useMutation<TCreatChatNotificationResponse, IInternalApiError, TCreateChatNotificationBody>(
    async (body) =>
      apiRequest<TCreatChatNotificationResponse, TCreateChatNotificationBody>("/notifications", {
        method: "POST",
        body,
      }),
    options
  );
