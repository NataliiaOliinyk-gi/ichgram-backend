import { Request, Response } from "express";

import * as postsService from "../services/posts.service";

import validateBody from "../utils/validateBody";

import { addPostSchema } from "../validation/posts.schema";
import { PostDocument } from "../db/models/Post";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const addPostController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(addPostSchema, req.body);

  const result: PostDocument = await postsService.addPost(
    {
      payload: req.body,
      file: req.file,
    },
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const getPostsController = async (req: Request, res: Response): Promise<void> => {
    const result: PostDocument[] = await postsService.getPosts();

    res.json(result);
};
