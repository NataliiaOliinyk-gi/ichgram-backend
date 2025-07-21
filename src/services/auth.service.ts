import bcrypt from "bcrypt";

import User from "../db/models/User";
import {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../functions/jsonwebtoken";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument } from "../db/models/User";
import { RegisterSchema, LoginSchema } from "../validation/auth.schema";

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
}: LoginSchema): Promise<string> => {
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

  return token;
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

export const logout = async ({ _id }: UserDocument): Promise<void> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);
  user.token = "";
  user.refreshToken = "";
  await user.save();
};
