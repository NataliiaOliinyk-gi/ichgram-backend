import bcrypt from "bcrypt";

import User from "../db/models/User";
import {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../functions/jsonwebtoken";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument } from "../db/models/User";
import {
  RegisterSchema,
  LoginSchema,
  ChangePasswordSchema,
  ChangeEmailSchema,
  DeleteAccountSchema,
} from "../validation/auth.schema";

interface IUserFind {
  email: string;
}

export const register = async (
  payload: RegisterSchema
): Promise<UserDocument> => {
  const hashPassword: string = await bcrypt.hash(payload.password, 10);

  return User.create({
    ...payload,
    password: hashPassword,
  });
};

export const login = async ({
  email,
  password,
}: LoginSchema): Promise<{ token: string; refreshToken: string }> => {
  const userFind: IUserFind = {
    email,
  };
  const user: UserDocument | null = await User.findOne(userFind);
  if (!user) throw HttpExeption(401, `User with email ${email} not found`);

  const passwordCompare: boolean = await bcrypt.compare(
    password,
    user.password
  );
  if (!passwordCompare) throw HttpExeption(401, "Password invalid");

  const token: string = createToken(user);
  const refreshToken: string = createRefreshToken(user);

  user.token = token;
  user.refreshToken = refreshToken;
  await user.save();

  return { token, refreshToken };
};

export const refreshToken = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  const id = verifyRefreshToken(refreshToken);
  const user: UserDocument | null = await User.findById(id);

  if (!user || user.refreshToken !== refreshToken)
    throw HttpExeption(403, "Invalid token");
  const token: string = createToken(user);
  const newRefreshToken: string = createRefreshToken(user);

  user.token = token;
  user.refreshToken = newRefreshToken;
  await user.save();

  return { token, refreshToken: newRefreshToken };
};

export const getCurrent = async (user: UserDocument): Promise<string> => {
  const token: string = createToken(user);
  user.token = token;
  await user.save();

  return token;
};

export const changePassword = async (
  { password, newPassword }: ChangePasswordSchema,
  { _id }: UserDocument
): Promise<boolean> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);

  const passwordCompare: boolean = await bcrypt.compare(
    password,
    user.password
  );
  if (!passwordCompare) throw HttpExeption(401, "Password invalid");
  if (password === newPassword)
    throw HttpExeption(400, "The new password must not match the old one");

  const hashPassword: string = await bcrypt.hash(newPassword, 10);
  user.password = hashPassword;
  user.token = "";
  user.refreshToken = "";
  await user.save();

  return true;
};

export const changeEmail = async (
  { password, newEmail }: ChangeEmailSchema,
  { _id }: UserDocument
): Promise<string> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);

  const passwordCompare: boolean = await bcrypt.compare(
    password,
    user.password
  );
  if (!passwordCompare) throw HttpExeption(401, "Password invalid");

  if (newEmail === user.email)
    throw HttpExeption(
      400,
      "The new email must be different from the current one"
    );

  user.email = newEmail;
  user.token = "";
  user.refreshToken = "";
  await user.save();

  return user.email;
};

export const logout = async ({ _id }: UserDocument): Promise<boolean> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);
  user.token = "";
  user.refreshToken = "";

  await user.save();
  return true;
};

export const deleteAccount = async (
  { password }: DeleteAccountSchema,
  { _id }: UserDocument
): Promise<boolean> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);

  const passwordCompare: boolean = await bcrypt.compare(
    password,
    user.password
  );
  if (!passwordCompare) throw HttpExeption(401, "Password invalid");

  await user.deleteOne();
  return true;
};
