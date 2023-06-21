import type { IAccessTokenPayload } from "../../../lib/auth/types";
import type { IChatMessagePayload } from "../../../lib/event/pubsub";
import type { SocketEventTypeEnum } from "./enums";

export interface IServerToClientEvents {
  [SocketEventTypeEnum.NOTIFICATION_MESSAGE]: (payload: IChatMessagePayload) => void;
}

export interface IClientToServerEvents {
  [SocketEventTypeEnum.JOIN_CHANNEL]: (notificationId: string) => void;
}

export interface ISocketData {
  user: IAccessTokenPayload;
}
