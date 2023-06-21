/* eslint-disable @typescript-eslint/no-type-alias */
import type { Message } from "@prisma/client";
import type { Redis } from "@upstash/redis";

import type { MessageTaskTypeEnum } from "./enums";
import { PubSubMessageEnum } from "./enums";

export interface IChatMessagePayload {
  message: Message;
}

export type TPubSubMessage =
  | {
      type: MessageTaskTypeEnum.CHAT_MESSAGE;
      payload: IChatMessagePayload;
    }
  | {
      type: MessageTaskTypeEnum.TMP;
      payload: string;
    };

export async function publishMessage(redis: Redis, message: TPubSubMessage): Promise<void> {
  await redis.publish(PubSubMessageEnum.NOTIFICATION, JSON.stringify(message));
}
