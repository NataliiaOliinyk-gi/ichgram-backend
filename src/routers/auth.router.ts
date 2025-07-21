import { Router } from "express";

import {
  registerController,
  loginController,
  getCurrentController,
  refreshTokenController,
  logoutController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authorization";

const authRouter: Router = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/refresh-token", refreshTokenController);
authRouter.get("/current", authenticate, getCurrentController);
authRouter.post("/logout", authenticate, logoutController);

export default authRouter;
