import { Request, Response } from "express";

import * as postsService from "../services/posts.service";

import validateBody from "../utils/validateBody";

import { addPostSchema, updatePostSchema } from "../validation/posts.schema";
import { PostDocument } from "../db/models/Post";
import { AuthenticatedRequest } from "../typescript/interfaces";
import { IPostResponse } from "../services/posts.service";

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

export const getPostsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result: IPostResponse[] = await postsService.getPosts((req as AuthenticatedRequest).user);

  res.json(result);
};

export const getMyPostsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result: IPostResponse[] = await postsService.getMyPosts(
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const getPostsByUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result: IPostResponse[] = await postsService.getPostsByUser(id, (req as AuthenticatedRequest).user);

  res.json(result);
};

export const getPostByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result = await postsService.getPostById(id);

  res.json(result);
};

export const updatePostController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(updatePostSchema, req.body);

  const { id } = req.params;
  const result = await postsService.updatePost(
    id,
    {
      payload: req.body,
      file: req.file,
    },
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};

export const deletePostController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const result = await postsService.deletePost(
    id,
    (req as AuthenticatedRequest).user
  );

  res.json(result);
};
