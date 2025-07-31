import { Request, Response } from "express";

import * as usersService from "../services/users.service";

import { PublicUserResponse } from "../db/models/User";
// import { AuthenticatedRequest } from "../typescript/interfaces";

export const getUserByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result: PublicUserResponse = await usersService.getUserById(id);

  res.json(result);
};
