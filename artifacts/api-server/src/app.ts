import express, { type Express } from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import healthRouter from "./routes/health";
import contactsRouter from "./routes/contacts";
import { createChatsRouter } from "./routes/chats";

const expressApp: Express = express();

expressApp.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

const httpServer = createServer(expressApp);

export const io = new IOServer(httpServer, {
  path: "/ws/socket.io",
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Client connected");

  socket.on("join_chat", (chatId: number) => {
    socket.join(`chat:${chatId}`);
    logger.info({ socketId: socket.id, chatId }, "Joined chat room");
  });

  socket.on("leave_chat", (chatId: number) => {
    socket.leave(`chat:${chatId}`);
    logger.info({ socketId: socket.id, chatId }, "Left chat room");
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Client disconnected");
  });
});

expressApp.use("/api", healthRouter);
expressApp.use("/api/chats", createChatsRouter(io));
expressApp.use("/api/contacts", contactsRouter);

export default httpServer;
