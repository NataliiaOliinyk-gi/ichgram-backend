import { Request, Response } from "express";

import * as myProfileService from "../services/myProfile.service";

import validateBody from "../utils/validateBody";

import { updateUserSchema } from "../validation/users.schema";
import { PublicUserResponse } from "../db/models/User";
import { AuthenticatedRequest } from "../typescript/interfaces";


export const getMyProfileController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result: PublicUserResponse = await myProfileService.getMyProfile((req as AuthenticatedRequest).user);

  res.json(result);
};


export const updateMyProfileController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(updateUserSchema, req.body);

  const result: PublicUserResponse = await myProfileService.updateMyProfile({
    payload: req.body,
    file: req.file,
  },
  (req as AuthenticatedRequest).user);

  res.json(result);
};
