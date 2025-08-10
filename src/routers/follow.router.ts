import { Router } from "express";

import { authenticate } from "../middlewares/authorization";
import { addFollowController } from "../controllers/follow.controller";

const followRouter: Router = Router();

followRouter.post("/", authenticate, addFollowController);

export default followRouter;