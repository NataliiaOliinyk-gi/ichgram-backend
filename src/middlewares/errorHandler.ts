import { Request, Response, NextFunction } from "express";

import { HttpError } from "../typescript/classes";

const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status = 500, message } = error;
  res.status(status).json({
    message,
  });
};

export default errorHandler;
