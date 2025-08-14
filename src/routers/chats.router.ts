import { Router } from "express";

import { authenticate } from "../middlewares/authorization";

import {
  listConversationsController,
  getMessagesByConversationController,
  startConversationController,
} from "../controllers/chats.controller";

const chatsRouter: Router = Router();

chatsRouter.get("/", authenticate, listConversationsController);
chatsRouter.get(
  "/:id/messages",
  authenticate,
  getMessagesByConversationController
);
chatsRouter.post("/start", authenticate, startConversationController);

export default chatsRouter;
