import { Router } from "express";

import upload from "../middlewares/upload";

import {
  getMyProfileController,
  updateMyProfileController,
} from "../controllers/myProfile.controller";

import { authenticate } from "../middlewares/authorization";

const myProfileRouter: Router = Router();

myProfileRouter.get("/", authenticate, getMyProfileController);
myProfileRouter.put(
  "/",
  authenticate,
  upload.single("profilePhoto"),
  updateMyProfileController
);

export default myProfileRouter;
