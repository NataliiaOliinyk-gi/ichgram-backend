import { Request, Response } from "express";

import * as commentsService from "../services/comments.service";

import validateBody from "../utils/validateBody";
import parsePaginationParams from "../utils/parsePaginationParams";

import {
  addCommentSchema,
  updateCommentSchema,
} from "../validation/comments.schema";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const addCommentByPostIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(addCommentSchema, req.body);
  const { postId } = req.params;
  const result = await commentsService.addCommentByPostId(
    postId,
    req.body,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const updateCommentByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(updateCommentSchema, req.body);

  const { id: commentId } = req.params;
  const result = await commentsService.updateCommentById(
    commentId,
    req.body,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const deleteCommentByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id: commentId } = req.params;
  const result = await commentsService.deleteCommentById(
    commentId,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const getCommentByPostIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page, limit } = parsePaginationParams(req.query);
  const { postId } = req.params;

  const result = await commentsService.getCommentsByPostId(postId, {
    page,
    limit,
  });

  res.json(result);
};

