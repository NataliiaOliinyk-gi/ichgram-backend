import { Request, Response, NextFunction } from "express";

import HttpExeption from "../utils/HttpExeption";

import { getUserByBearer } from "../utils/auth.helpers";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorization: string | undefined = req.headers.authorization;

  try {
    const user = await getUserByBearer(authorization);

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      throw HttpExeption(401, error.message);
    }
  }
};
