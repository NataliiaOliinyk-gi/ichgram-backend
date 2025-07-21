import { Router } from "express";

import {
  registerController,
  loginController,
  getCurrentController,
  refreshTokenController,
  changePasswordController,
  changeEmailController,
  logoutController,
  deleteAccountController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authorization";

const authRouter: Router = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.get("/current", authenticate, getCurrentController);
authRouter.put("/change-password", authenticate, changePasswordController);
authRouter.put("/change-email", authenticate, changeEmailController);
authRouter.post("/logout", authenticate, logoutController);
authRouter.delete("/delete-account", authenticate, deleteAccountController);

export default authRouter;
