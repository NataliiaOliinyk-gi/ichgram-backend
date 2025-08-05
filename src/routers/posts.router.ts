import { Router } from "express";

import upload from "../middlewares/upload";
import { authenticate } from "../middlewares/authorization";
import {
  addPostController,
  getPostsController,
  getMyPostsController,
  getPostsByUserController,
  getPostByIdController,
  updatePostController,
  deletePostController,
} from "../controllers/posts.controller";

const postsRouter: Router = Router();

postsRouter.post("/", authenticate, upload.single("photo"), addPostController);
postsRouter.get("/", authenticate, getPostsController);
postsRouter.get("/my", authenticate, getMyPostsController);
postsRouter.get("/user/:id", authenticate, getPostsByUserController);
postsRouter.get("/:id", authenticate, getPostByIdController);
postsRouter.put("/:id", authenticate, upload.single("photo"), updatePostController);
postsRouter.delete("/:id", authenticate, deletePostController);

export default postsRouter;
