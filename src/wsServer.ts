import { Server as WsServer, Socket } from "socket.io";
import { createServer, Server } from "node:http";
import mongoose, { Types } from "mongoose";

import HttpExeption from "./utils/HttpExeption";

import { getUserByBearer } from "./utils/auth.helpers";
import { getOrCreateConversation, getMessages, addMessage, markRead } from "./services/chat.service";

const socketPort: number = Number(process.env.SOCKET_PORT || 5000);
const { FRONTEND_URL } = process.env;

if (typeof FRONTEND_URL !== "string")
  throw HttpExeption(500, "FRONTEND_URL not found");

// Тип, який кладемо в сокет після auth
declare module "socket.io" {
  interface Socket {
    userId?: Types.ObjectId;
  }
}

const startWebsocketServer = (): void => {
  const httpServer: Server = createServer();

  const wsServer = new WsServer(httpServer, {
    // cors: {
    //   origin: "*",
    // },
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  });

  // Middleware auth
  wsServer.use(async (socket: Socket, next) => {
    try {
      const authHeader =
        (socket.handshake.headers.authorization as string | undefined) ??
        (socket.handshake.auth?.token
          ? `Bearer ${socket.handshake.auth.token}`
          : undefined);

      const user = await getUserByBearer(authHeader);
      socket.userId = user._id;

      // окремий "room" юзера (для таргетованих подій)
      socket.join(`user:${user._id.toString()}`);
      next();
    } catch (error) {
      next(HttpExeption(401, "Auth failed"));
    }
  });

  wsServer.on("connection", (socket: Socket): void => {
    const me = socket.userId;
    if (!me) throw HttpExeption(401, "User not found")

    // ---- JOIN / CREATE DIALOG ----

    socket.on(
      "chat:join",
      async ({ otherUserId }: { otherUserId: string }, cb) => {
        try {
          const other = new mongoose.Types.ObjectId(otherUserId);
          const conv = await getOrCreateConversation(me, other);
          const room = `conv:${conv._id.toString()}`;
          socket.join(room);
          if (cb)
            cb({
              ok: true,
              conversationId: conv._id,
              lastMessageText: conv.lastMessageText,
              lastMessageAt: conv.lastMessageAt,
            });
        } catch (e: any) {
          cb?.({ ok: false, error: e.message });
        }
      }
    );

    // ---- LOAD MESSAGES (pagination) ----
    socket.on(
      "chat:load",
      async (
        {
          conversationId,
          page,
          limit,
        }: { conversationId: string; page?: number; limit?: number },
        cb
      ) => {
        try {
          const cid = new mongoose.Types.ObjectId(conversationId);
          const data = await getMessages(cid, page, limit);
          cb?.({ ok: true, ...data });
        } catch (e: any) {
          cb?.({ ok: false, error: e.message });
        }
      }
    );

    // ---- SEND MESSAGE ----
    socket.on(
      "chat:send",
      async (
        {
          conversationId,
          text,
          toUserId,
        }: { conversationId?: string; text: string; toUserId?: string },
        cb
      ) => {
        try {
          let convId: Types.ObjectId;
          if (conversationId) {
            convId = new mongoose.Types.ObjectId(conversationId);
          } else if (toUserId) {
            const other = new mongoose.Types.ObjectId(toUserId);
            const conv = await getOrCreateConversation(me, other);
            convId = conv._id;
          } else {
            throw new Error("conversationId or toUserId is required");
          }
          const msg = await addMessage(convId, me, text);
          const room = `conv:${convId.toString()}`;
          wsServer.to(room).emit("chat:new_message", {
            _id: msg._id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            text: msg.text,
            createdAt: msg.createdAt,
          });

          // пушимо іншому юзеру в його персональну кімнату (для бейджиків/лістів)
          // учасники діалогу = 2; знайдемо "іншого"
          // (можеш замінити на окремий сервіс, якщо хочеш діставати participants)
          wsServer.to(`user:${toUserId}`).emit("chat:notify", {
            conversationId: convId,
          });

          cb?.({ ok: true, conversationId: convId, messageId: msg._id });
        } catch (e: any) {
          cb?.({ ok: false, error: e.message });
        }
      }
    );

    // ---- READ ----
    socket.on(
      "chat:read",
      async ({ conversationId }: { conversationId: string }) => {
        try {
          const cid = new mongoose.Types.ObjectId(conversationId);
          await markRead(cid, me);
          wsServer.to(`conv:${cid.toString()}`).emit("chat:read", {
            conversationId,
            userId: me,
          });
        } catch {
          /* ignore */
        }
      }
    );

    // ---- TYPING ----
    socket.on(
      "chat:typing",
      ({
        conversationId,
        isTyping,
      }: {
        conversationId: string;
        isTyping: boolean;
      }) => {
        const room = `conv:${conversationId}`;
        socket
          .to(room)
          .emit("chat:typing", {
            conversationId,
            userId: me,
            isTyping,
          });
      }
    );

    // ---- disconnect ----
    socket.on("disconnect", (): void => {
      console.log("User disconnected or offline");
    });
  });

  httpServer.listen(socketPort, () =>
    console.log(`Websocket run on ${socketPort} port`)
  );
};

export default startWebsocketServer;
