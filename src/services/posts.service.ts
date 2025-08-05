import { unlink } from "node:fs/promises";

import Post from "../db/models/Post";
import User from "../db/models/User";
import HttpExeption from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";

import { UserDocument } from "../db/models/User";
import { PostDocument } from "../db/models/Post";
import { AddPostSchema } from "../validation/posts.schema";

interface IAddPost {
  payload: AddPostSchema;
  file: Express.Multer.File | undefined;
}

export const addPost = async (
  { payload, file }: IAddPost,
  { _id }: UserDocument
): Promise<PostDocument> => {
  //   const user: UserDocument | null = await User.findById(_id);
  //   if (!user) throw HttpExeption(401, `User not found`);

  let photo: string = "";
  if (file) {
    const { url: image } = await cloudinary.uploader.upload(file.path, {
      folder: "ichgram",
      use_filename: true,
    });
    photo = image;
    await unlink(file.path);
  }

  return await Post.create<PostDocument>({
    userId: _id,
    text: payload.text,
    photo,
  });
};

export const getPosts = (): Promise<PostDocument[]> =>
  Post.find().populate("userId", "username fullName profilePhoto");
