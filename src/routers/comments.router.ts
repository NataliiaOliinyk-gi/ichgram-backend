import { Router } from "express";

import { authenticate } from "../middlewares/authorization";
import {
  addCommentByPostIdController,
  getCommentByPostIdController,
  updateCommentByIdController,
  deleteCommentByIdController,
} from "../controllers/comments.controller";

const commentsRouter: Router = Router();

commentsRouter.post(
  "/post/:postId",
  authenticate,
  addCommentByPostIdController
);
commentsRouter.get("/post/:postId", authenticate, getCommentByPostIdController);
commentsRouter.put("/:id", authenticate, updateCommentByIdController);
commentsRouter.delete("/:id", authenticate, deleteCommentByIdController);

export default commentsRouter;
