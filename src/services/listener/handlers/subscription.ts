import { MessageTaskTypeEnum, PubSubMessageEnum } from "../../../lib/event/enums";
import type { TPubSubMessage } from "../../../lib/event/pubsub";
import { subscriber } from "../../../lib/event/subscriber";
import { listenerLogger } from "../../../lib/logger/Logger";
import { SocketEventTypeEnum } from "../utils/enums";
import { io } from "../utils/io";

function handleMessage(channel: string, { type, payload }: TPubSubMessage): void {
  if (channel !== PubSubMessageEnum.NOTIFICATION) {
    return;
  }

  if (type === MessageTaskTypeEnum.CHAT_MESSAGE) {
    listenerLogger.info("Received task for sending chat message");
    io.to(payload.message.notification_id).emit(SocketEventTypeEnum.NOTIFICATION_MESSAGE, payload);
  }

  // // eslint-disable-next-line sonarjs/no-small-switch
  // switch (type) {
  //   case MessageTaskTypeEnum.CHAT_MESSAGE:
  //     listenerLogger.info("Received task for sending chat message");
  //     io.to(payload.message.notification_id).emit(SocketEventTypeEnum.NOTIFICATION_MESSAGE, payload);
  //     break;
  //   default:
  //     break;
  // }
}

export function handleSubscriptions(): void {
  listenerLogger.info("Listener running");

  subscriber.on("message", (channel, message) => {
    handleMessage(channel, JSON.parse(message));
  });

  void subscriber.subscribe(PubSubMessageEnum.NOTIFICATION);
}
