import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import { queryClient } from "../../lib/client/queryClient";
import { QueryKeys } from "../../lib/client/QueryKeys";
import type { IInternalApiError } from "../../lib/http/types";
import type { TCreateMessageBody } from "../../lib/schema/messages";
import type { TCreateMessageResponse } from "../../pages/api/messages";
import type { TGetMessagesResponse } from "../../pages/api/messages/[notification_id]";

export const useMessagesQuery = (
  notificationId: string,
  options?: Omit<UseQueryOptions<TGetMessagesResponse, IInternalApiError>, "queryFn" | "queryKey">
): UseQueryResult<TGetMessagesResponse, IInternalApiError> =>
  useQuery<TGetMessagesResponse, IInternalApiError>(
    QueryKeys.Messages.messages(notificationId),
    async () => apiRequest<TGetMessagesResponse>(`/messages/${notificationId}`),
    options
  );

export const useCreateMessageMutation = (
  options?: UseMutationOptions<TCreateMessageResponse, IInternalApiError, TCreateMessageBody>
): UseMutationResult<TCreateMessageResponse, IInternalApiError, TCreateMessageBody> =>
  useMutation<TCreateMessageResponse, IInternalApiError, TCreateMessageBody>(
    async (body) => apiRequest<TCreateMessageResponse, TCreateMessageBody>("/messages", { method: "POST", body }),
    {
      onSuccess: ({ message }) => {
        const queryKeys = QueryKeys.Messages.messages(message.notification_id);

        queryClient.setQueryData<TGetMessagesResponse>(queryKeys, (prev) => ({
          messages: [...(prev?.messages ?? []), message],
        }));
      },
      ...options,
    }
  );
