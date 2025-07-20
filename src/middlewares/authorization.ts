import { Request, Response, NextFunction } from "express";

import User, { UserDocument } from "../db/models/User";
import HttpExeption from "../utils/HttpExeption";

import { verifyToken } from "../functions/jsonwebtoken";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorization: string | undefined = req.headers.authorization;
  if (!authorization) throw HttpExeption(401, "Authorization header missing");

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") throw HttpExeption(401, "Bearer missing");

  try {
    const id = verifyToken(token);
    const user: UserDocument | null = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      return next(HttpExeption(401, "User not found"));
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      throw HttpExeption(401, error.message);
    }
  }
};
