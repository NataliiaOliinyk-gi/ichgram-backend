import { Router } from "express";

import { getUserByIdController } from "../controllers/users.controller";
import { authenticate } from "../middlewares/authorization";

const usersRouter: Router = Router();

usersRouter.get("/:id", authenticate, getUserByIdController);

export default usersRouter;
