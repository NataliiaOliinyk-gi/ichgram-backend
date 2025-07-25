import { Request, Response } from "express";

const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `${req.url} not found`,
  });
};

export default notFoundHandler;
