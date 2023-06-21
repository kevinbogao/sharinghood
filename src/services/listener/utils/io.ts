import { createServer } from "http";
import { Server } from "socket.io";
import type { EventsMap } from "socket.io/dist/typed-events";

import { TokenTypeEnum } from "../../../lib/auth/enums";
import { verifyJwt } from "../../../lib/auth/jwt";
import type { IAccessTokenPayload } from "../../../lib/auth/types";
import { CONFIG } from "../../../lib/Config";
import { prisma } from "../../../lib/db/prisma";
import { SocketEventTypeEnum } from "../utils/enums";
import type { IClientToServerEvents, IServerToClientEvents, ISocketData } from "./types";

const httpServer = createServer();

export const io = new Server<IClientToServerEvents, IServerToClientEvents, EventsMap, ISocketData>(httpServer, {
  cors: CONFIG.API.CORS,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (token) {
    const user = verifyJwt<IAccessTokenPayload>(token, TokenTypeEnum.ACCESS_TOKEN);
    socket.data.user = user;
  }

  next();
});

io.on("connection", (socket) => {
  const { user } = socket.data;
  socket.on(SocketEventTypeEnum.JOIN_CHANNEL, async (notificationId) => {
    if (!user) {
      return;
    }

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, OR: [{ creator_id: user.user_id }, { recipient_id: user.user_id }] },
    });

    if (notification) {
      await socket.join(notification.id);
    }
  });
});
