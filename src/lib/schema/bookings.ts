import type { z } from "zod";
import { string } from "zod";

import { bookingModel } from "../db/models";

export const createBookingBodySchema = bookingModel
  .pick({
    time_frame: true,
    post_id: true,
    community_id: true,
  })
  .extend({
    date_need: string().datetime().optional(),
    date_return: string().datetime().optional(),
  });
export type TCreateBookingBody = z.infer<typeof createBookingBodySchema>;

export const updateBookingQuerySchema = bookingModel.pick({ id: true });
export type TUpdateBookingQuery = z.infer<typeof updateBookingQuerySchema>;

export const updateBookingBodySchema = bookingModel.pick({ status: true });
export type TUpdateBookingBody = z.infer<typeof updateBookingBodySchema>;
