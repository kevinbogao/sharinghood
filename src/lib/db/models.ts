/* eslint-disable sonarjs/no-duplicate-string */

import { BookingStatusEnum, ItemConditionEnum, NotificationTypeEnum, TimeFrameEnum } from "@prisma/client";
import { boolean, date, nativeEnum, object, string } from "zod";

import { cuidSchema } from "../schema";

export const userModel = object({
  id: cuidSchema,
  name: string().min(1, { message: "Name is required" }),
  description: string().nullish(),
  email: string().min(1, { message: "Email is required" }).email(),
  password: string().min(7, { message: "Password too short" }),
  apartment: string().nullable(),
  image_url: string().nullable(),
  last_login: date().nullable(),
  is_notified: boolean(),
  created_at: date(),
  updated_at: date(),
});

export const communityModel = object({
  id: cuidSchema,
  name: string().min(1, { message: "Name is required" }),
  code: string().min(1, { message: "Code is required" }),
  zip_code: string().nullish(),
  password: string().nullish(),
  created_at: date(),
  updated_at: date(),
});

export const postModel = object({
  id: cuidSchema,
  title: string().min(1, { message: "Title is required" }),
  description: string().min(1, { message: "Description is required" }),
  condition: nativeEnum(ItemConditionEnum),
  image_url: string(),
  is_giveaway: boolean(),
  creator_id: cuidSchema,
  created_at: date(),
  updated_at: date(),
});

export const requestModel = object({
  id: cuidSchema,
  title: string().min(1, { message: "Title is required" }),
  description: string().min(1, { message: "Description is required" }),
  image_url: string(),
  time_frame: nativeEnum(TimeFrameEnum),
  date_need: date().nullable(),
  date_return: date().nullable(),
  creator_id: cuidSchema,
  community_id: cuidSchema,
  created_at: date(),
  updated_at: date(),
});

export const threadModel = object({
  id: cuidSchema,
  content: string().min(1, { message: "Content is required" }),
  post_id: cuidSchema.nullable(),
  request_id: cuidSchema.nullable(),
  creator_id: cuidSchema,
  community_id: cuidSchema,
  created_at: date(),
  updated_at: date(),
});

export const bookingModel = object({
  id: cuidSchema,
  status: nativeEnum(BookingStatusEnum),
  time_frame: nativeEnum(TimeFrameEnum),
  date_need: date().nullable(),
  date_return: date().nullable(),
  post_id: cuidSchema,
  booker_id: cuidSchema,
  community_id: cuidSchema,
  created_at: date(),
  updated_at: date(),
});

export const notificationModel = object({
  id: cuidSchema,
  type: nativeEnum(NotificationTypeEnum),
  post_id: cuidSchema.nullable(),
  booking_id: cuidSchema.nullable(),
  community_id: cuidSchema,
  creator_id: cuidSchema,
  recipient_id: cuidSchema,
  notifier_id: cuidSchema.nullable(),
  created_at: date(),
  updated_at: date(),
});

export const messageModel = object({
  id: cuidSchema,
  content: string().min(0),
  notification_id: cuidSchema,
  creator_id: cuidSchema,
  updated_at: date(),
});
