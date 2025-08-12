import { Request, Response } from "express";

import * as usersService from "../services/users.service";

import { AuthenticatedRequest } from "../typescript/interfaces";
import { IUserByIdResponse } from "../services/users.service";

export const getUserByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result: IUserByIdResponse = await usersService.getUserById(id,  (req as AuthenticatedRequest).user);

  res.json(result);
};


export const getFollowersController = ()=>{};
export const getFollowingController = ()=>{};