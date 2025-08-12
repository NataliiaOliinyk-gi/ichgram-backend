import { Request, Response } from "express";

import * as followService from "../services/follow.service";

import validateBody from "../utils/validateBody";

import { followUserSchema } from "../validation/follow.schema";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const followUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(followUserSchema, req.params);

  const result = await followService.followUser(
    req.params.targetId,
    (req as AuthenticatedRequest).user
  );
  res.json(result);
};

export const unfollowUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(followUserSchema, req.params);

  const result = await followService.unfollowUser(
    req.params.targetId,
    (req as AuthenticatedRequest).user
  );
  res.json(result);
};
