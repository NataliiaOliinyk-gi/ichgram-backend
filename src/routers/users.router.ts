import { Router } from "express";

import upload from "../middlewares/upload";

import {
  getUserByIdController,
  updateUserController,
} from "../controllers/users.controller";
import { authenticate } from "../middlewares/authorization";

const usersRouter: Router = Router();

usersRouter.get("/:id", authenticate, getUserByIdController);
usersRouter.put(
  "/me",
  authenticate,
  upload.single("profilePhoto"),
  updateUserController
);

export default usersRouter;
