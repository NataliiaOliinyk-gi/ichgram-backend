import { unlink } from "node:fs/promises";

import Post from "../db/models/Post";
import User from "../db/models/User";
import Like from "../db/models/Like";

import HttpExeption from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";
import markPostsWithUserLikes from "../utils/markPostsWithUserLikes";

import { UserDocument } from "../db/models/User";
import { PostDocument, IPostForLean } from "../db/models/Post";
import { AddPostSchema, UpdatePostSchema } from "../validation/posts.schema";

export interface IPostResponse extends IPostForLean {
  isLikedByCurrentUser: boolean;
}

interface IAddPost {
  payload: AddPostSchema;
  file: Express.Multer.File | undefined;
}

interface IUpdatePost {
  payload?: UpdatePostSchema;
  file?: Express.Multer.File | undefined;
}

export const addPost = async (
  { payload, file }: IAddPost,
  { _id }: UserDocument
): Promise<PostDocument> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  let photo: string = "";
  if (file) {
    const { url: image } = await cloudinary.uploader.upload(file.path, {
      folder: "ichgram",
      use_filename: true, // не переименовывать файл, не обязательная настройка
    });
    await unlink(file.path); // удалить файл из папки temp
    photo = image;
  }

  const post = await Post.create({
    userId: _id,
    text: payload.text,
    photo,
  });

  return post;
};

export const getPosts = async ({
  _id,
}: UserDocument): Promise<IPostResponse[]> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const posts = await Post.find({ userId: { $ne: _id } })
    .populate("userId", "username fullName profilePhoto")
    .sort({ updatedAt: -1 })
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean[]>();

  return await markPostsWithUserLikes(posts, _id);
};

export const getMyPosts = async ({
  _id,
}: UserDocument): Promise<IPostResponse[]> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const posts = await Post.find({ userId: _id })
    .populate("userId", "username fullName profilePhoto")
    .sort({ updatedAt: -1 })
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean[]>();

  return await markPostsWithUserLikes(posts, _id);
};

export const getPostsByUser = async (
  id: string,
  currentUser: UserDocument
): Promise<IPostResponse[]> => {
  const user: UserDocument | null = await User.findById(id);
  if (!user) throw HttpExeption(401, `User not found`);

  const posts = await Post.find({ userId: id })
    .populate("userId", "username fullName profilePhoto")
    .sort({ updatedAt: -1 })
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean[]>();

  return await markPostsWithUserLikes(posts, currentUser._id);
};

export const getPostById = async (id: string): Promise<PostDocument> => {
  const post: PostDocument | null = await Post.findById(id).select(
    "userId text photo likesCount commentsCount createdAt updatedAt"
  );
  if (!post) throw HttpExeption(404, `Post not found`);

  return post;
};

export const updatePost = async (
  id: string,
  { payload, file }: IUpdatePost,
  { _id }: UserDocument
): Promise<PostDocument> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const post: PostDocument | null = await Post.findById(id).select(
    "userId text photo likesCount commentsCount createdAt updatedAt"
  );
  if (!post) throw HttpExeption(404, `Post not found`);

  if (!post.userId.equals(_id))
    throw HttpExeption(
      403,
      `Permission denied: You are not the author of this post`
    );

  if (file) {
    const { url: image } = await cloudinary.uploader.upload(file.path, {
      folder: "ichgram",
      use_filename: true,
    });
    await unlink(file.path);
    post.photo = image;
  }
  if (payload?.text) post.text = payload.text;

  await post.save();

  return post;
};

export const deletePost = async (
  id: string,
  { _id }: UserDocument
): Promise<PostDocument> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const post: PostDocument | null = await Post.findById(id);
  if (!post) throw HttpExeption(404, `Post not found`);

  if (!post.userId.equals(_id))
    throw HttpExeption(
      403,
      `Permission denied: You are not the author of this post`
    );

  await post.deleteOne();

  return post;
};
