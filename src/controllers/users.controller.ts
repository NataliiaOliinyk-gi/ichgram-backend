import { Request, Response } from "express";

import * as usersService from "../services/users.service";
import parsePaginationParams from "../utils/parsePaginationParams";
import HttpExeption from "../utils/HttpExeption";

import { AuthenticatedRequest } from "../typescript/interfaces";
import { IUserResponse } from "../services/users.service";

export const searchUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const q = String(req.query.q || "").trim();
  if (!q) throw HttpExeption(400, "Query param 'q' is required");

  const { page, limit } = parsePaginationParams(req.query);

  const result = await usersService.searchUsers(
    q,
    (req as AuthenticatedRequest).user,
    { page, limit }
  );

  res.json(result);
};

export const getUserByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result: IUserResponse = await usersService.getUserById(
    id,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const getFollowersController = () => {};
export const getFollowingController = () => {};
