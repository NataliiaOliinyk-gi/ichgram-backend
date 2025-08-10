import { Router } from "express";

import { authenticate } from "../middlewares/authorization";
import { addCommentController } from "../controllers/comments.controller";

const commentsRouter: Router = Router();

commentsRouter.post("/", authenticate, addCommentController);

export default commentsRouter;