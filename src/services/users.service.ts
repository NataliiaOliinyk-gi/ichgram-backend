import { unlink } from "node:fs/promises";

import User from "../db/models/User";
import HttpExeption from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";

import { UserDocument, PublicUserResponse } from "../db/models/User";
import { toPublicUserResponse } from "../utils/user.mapper";
import { UpdateUserSchema } from "../validation/users.schema";

interface IUpdateUser {
  payload: UpdateUserSchema;
  file: Express.Multer.File | undefined;
}

export const getUserById = async (id: string): Promise<PublicUserResponse> => {
  const user: UserDocument | null = await User.findById(id);
  if (!user) throw HttpExeption(401, `User not found`);

  const responceUser = toPublicUserResponse(user);
  return responceUser;
};

export const updateUser = async (
  { payload, file }: IUpdateUser,
  { _id }: UserDocument
): Promise<PublicUserResponse> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);

  if (file) {
    const { url: image } = await cloudinary.uploader.upload(file.path, {
      folder: "ichgram",
      use_filename: true, // не переименовывать файл, не обязательная настройка
    });
    await unlink(file.path); // удалить файл из папки temp
    user.profilePhoto = image;
  }
  if (payload.fullName) user.fullName = payload.fullName;
  if (payload.biography) user.biography = payload.biography;
  if (payload.username) user.username = payload.username;

  await user.save();

  const responceUser = toPublicUserResponse(user);
  return responceUser;
};
