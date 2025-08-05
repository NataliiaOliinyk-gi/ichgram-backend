import { Router } from "express";

import upload from "../middlewares/upload";
import { authenticate } from "../middlewares/authorization";
import { addPostController, getPostsController } from "../controllers/posts.controller";

const postsRouter: Router = Router();

postsRouter.post("/", authenticate, upload.single("photo"), addPostController);
postsRouter.get("/", authenticate, getPostsController);

export default postsRouter;
