import { Router } from "express";

import { authenticate } from "../middlewares/authorization";
import {
  getNotificationsController,
  markAsReadController,
} from "../controllers/notifications.controller";

const notificationsRouter: Router = Router();

notificationsRouter.get("/", authenticate, getNotificationsController);
notificationsRouter.put("/:id/read", authenticate, markAsReadController);

export default notificationsRouter;
