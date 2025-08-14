import { Request, Response } from "express";

import * as usersService from "../services/users.service";
import parsePaginationParams from "../utils/parsePaginationParams";
import HttpExeption from "../utils/HttpExeption";

import { AuthenticatedRequest } from "../typescript/interfaces";

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
  const result = await usersService.getUserById(
    id,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const getUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const users = await usersService.getUsersService(
    (req as AuthenticatedRequest).user
  );

  res.json(users);
};

export const getFollowersController = async (req: Request, res: Response) => {
  const me = (req as AuthenticatedRequest).user;
  const targetId = req.params.id ?? me._id.toString();

  const { page, limit } = parsePaginationParams(req.query);

  const result = await usersService.getFollowers({
    targetUserId: targetId,
    currentUserId: me._id,
    page,
    limit,
  });

  res.json(result);
};

export const getFollowingController = async (req: Request, res: Response) => {
  const me = (req as AuthenticatedRequest).user;
  const targetId = req.params.id ?? me._id.toString();

  const { page, limit } = parsePaginationParams(req.query);

  const result = await usersService.getFollowing({
    targetUserId: targetId,
    currentUserId: me._id,
    page,
    limit,
  });

  res.json(result);
};
