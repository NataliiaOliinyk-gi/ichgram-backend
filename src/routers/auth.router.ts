import { Router } from "express";

import {
  registerController,
  loginController,
  verifyController,
  resendVerifyEmailController,
  forgotPasswordController,
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
authRouter.post("/verify", verifyController);
authRouter.post("/resend-verify-email", resendVerifyEmailController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.get("/current", authenticate, getCurrentController);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.put("/change-password", authenticate, changePasswordController);
authRouter.put("/change-email", authenticate, changeEmailController);
authRouter.post("/logout", authenticate, logoutController);
authRouter.delete("/delete-account", authenticate, deleteAccountController);

export default authRouter;
