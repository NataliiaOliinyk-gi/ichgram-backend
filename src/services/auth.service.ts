import bcrypt from "bcrypt";

import User from "../db/models/User";
import { createToken } from "../functions/jsonwebtoken";
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
  return token;
};
