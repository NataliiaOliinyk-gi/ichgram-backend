import { Request, Response } from "express";

import * as likesService from "../services/likes.service";

import validateBody from "../utils/validateBody";

import { addLikeSchema } from "../validation/likes.schema";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const toggleLikeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(addLikeSchema, req.body);

  const result = await likesService.toggleLike(
    req.body.postId,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};
