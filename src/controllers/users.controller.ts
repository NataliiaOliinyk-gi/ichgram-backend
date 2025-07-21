import { Request, Response } from "express";

import * as usersService from "../services/users.service";

import validateBody from "../utils/validateBody";

import { updateUserSchema } from "../validation/users.schema";
import { PublicUserResponse } from "../db/models/User";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const getUserByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result: PublicUserResponse = await usersService.getUserById(id);

  res.json(result);
};

export const updateUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(updateUserSchema, req.body);

  const result: PublicUserResponse = await usersService.updateUser({
    payload: req.body,
    file: req.file,
  },
  (req as AuthenticatedRequest).user);

  res.json(result);
};
