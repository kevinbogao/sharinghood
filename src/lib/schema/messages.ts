import type { z } from "zod";
import { object } from "zod";

import { messageModel } from "../db/models";
import { cuidSchema } from ".";

export const createMessageBodySchema = messageModel.pick({ content: true, notification_id: true });
export type TCreateMessageBody = z.infer<typeof createMessageBodySchema>;

export const getMessagesQuerySchema = object({ notification_id: cuidSchema });
export type TGetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
