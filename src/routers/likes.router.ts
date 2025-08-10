import { Router } from "express";

import { authenticate } from "../middlewares/authorization";
import { toggleLikeController } from "../controllers/likes.controller";

const likesRouter: Router = Router();

likesRouter.post("/toggle", authenticate, toggleLikeController);

export default likesRouter;