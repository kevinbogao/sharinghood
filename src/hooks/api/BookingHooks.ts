/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "../../lib/client/apiRequest";
import type { IInternalApiError } from "../../lib/http/types";
import type { TCreateBookingBody, TUpdateBookingBody, TUpdateBookingQuery } from "../../lib/schema/bookings";
import type { TCreateBookingResponse } from "../../pages/api/bookings";
import type { TUpdateBookingResponse } from "../../pages/api/bookings/[id]";

export const useCreateBookingMutation = (
  options?: UseMutationOptions<TCreateBookingResponse, IInternalApiError, TCreateBookingBody>
): UseMutationResult<TCreateBookingResponse, IInternalApiError, TCreateBookingBody> =>
  useMutation<TCreateBookingResponse, IInternalApiError, TCreateBookingBody>(
    async (body) => apiRequest<TCreateBookingResponse, TCreateBookingBody>("/bookings", { method: "POST", body }),
    options
  );

// type TUpdateBookingVariables = TUpdateBookingBody & TUpdateBookingQuery;
// export const useUpdateBookingMutation = (
//   options?: Omit<UseMutationOptions<TUpdateBookingResponse, IInternalApiError, TUpdateBookingVariables>, "onSuccess">
// ): UseMutationResult<TUpdateBookingResponse, IInternalApiError, TUpdateBookingVariables> =>
//   useMutation<TUpdateBookingResponse, IInternalApiError, TUpdateBookingVariables>(
//     async ({ id, ...body }) =>
//       apiRequest<TUpdateBookingResponse, TUpdateBookingBody>(`/bookings/${id}`, { method: "PUT", body }),
//     {
//       onSuccess: ({ booking, notification_id }) => {
//         const queryKeys = QueryKeys.Notifications.notifications(booking.community_id);
//         queryClient.setQueryData<TGetNotificationsResponse>(queryKeys, (prev) => {
//           if (!prev?.notifications) {
//             return { notifications: [] };
//           }
//           const idx = prev.notifications.findIndex(({ id }) => id === notification_id);
//           const notification = prev.notifications[idx];
//           if (notification) {
//             const { booking: _booking } = notification;
//             const updatedBooking = _booking ? { ..._booking, status: booking.status } : null;
//             prev.notifications[idx] = { ...notification, booking: updatedBooking };
//           }

//           return {
//             notifications: prev.notifications,
//           };
//         });
//       },
//       ...options,
//     }
//   );

type TUpdateBookingVariables = TUpdateBookingBody & TUpdateBookingQuery;
export const useUpdateBookingMutation = (
  options?: UseMutationOptions<TUpdateBookingResponse, IInternalApiError, TUpdateBookingVariables>
): UseMutationResult<TUpdateBookingResponse, IInternalApiError, TUpdateBookingVariables> =>
  useMutation<TUpdateBookingResponse, IInternalApiError, TUpdateBookingVariables>(
    async ({ id, ...body }) =>
      apiRequest<TUpdateBookingResponse, TUpdateBookingBody>(`/bookings/${id}`, { method: "PUT", body }),
    options
  );
