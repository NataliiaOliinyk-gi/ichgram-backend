import { Router } from "express";

import {
  getUserByIdController,
  searchUsersController,
  getUsersController,
  getFollowersController,
  getFollowingController,
} from "../controllers/users.controller";
import { authenticate } from "../middlewares/authorization";

const usersRouter: Router = Router();

usersRouter.get("/search", authenticate, searchUsersController);

usersRouter.get("/", authenticate, getUsersController);
usersRouter.get("/followers", authenticate, getFollowersController);
usersRouter.get("/following", authenticate, getFollowingController);

usersRouter.get("/:id", authenticate, getUserByIdController);
usersRouter.get("/:id/followers", authenticate, getFollowersController);
usersRouter.get("/:id/following", authenticate, getFollowingController);

export default usersRouter;
