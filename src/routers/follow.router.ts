import { Router } from "express";

import { authenticate } from "../middlewares/authorization";
import {
  followUserController,
  unfollowUserController,
} from "../controllers/follow.controller";

const followRouter: Router = Router();

followRouter.post("/:targetId", authenticate, followUserController);
followRouter.delete("/:targetId", authenticate, unfollowUserController);

export default followRouter;
