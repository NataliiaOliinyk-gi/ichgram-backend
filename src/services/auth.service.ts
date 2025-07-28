import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import User from "../db/models/User";
import {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../functions/jsonwebtoken";
import HttpExeption from "../utils/HttpExeption";
import sendEmail from "../utils/sendEmail";

import { UserDocument } from "../db/models/User";
import { ILoginResponce } from "../controllers/auth.controller";
import {
  RegisterSchema,
  VerifyCodeSchema,
  LoginSchema,
  ChangePasswordSchema,
  ChangeEmailSchema,
  DeleteAccountSchema,
} from "../validation/auth.schema";

interface IUserFind {
  email: string;
}

const { FRONTEND_URL } = process.env;
if (typeof FRONTEND_URL !== "string")
  throw HttpExeption(500, "FRONTEND_URL not found");

export const register = async (
  payload: RegisterSchema
): Promise<UserDocument> => {
  const hashPassword: string = await bcrypt.hash(payload.password, 10);
  const verificationCode = nanoid();

  const user: UserDocument = await User.create({
    ...payload,
    password: hashPassword,
    verificationCode,
  });

  const verifyEmail = {
    to: [user.email],
    subject: "Verify email",
    html: `<a href="${FRONTEND_URL}?verificationCode=${verificationCode}" target="_blank">Click verify email</a>`,
  };
  await sendEmail(verifyEmail);

  return user;
};

// export const register = async (
//   payload: RegisterSchema
// ): Promise<UserDocument> => {
//   const hashPassword: string = await bcrypt.hash(payload.password, 10);

//   return User.create({
//     ...payload,
//     password: hashPassword,
//   });
// };

export const verify = async (code: VerifyCodeSchema): Promise<void> => {
  const user: UserDocument | null = await User.findOne({
    verificationCode: code,
  });
  if (!user) throw HttpExeption(401, "Email already verified or not found");
  user.verificationCode = "";
  user.verify = true;
  await user.save();
};

export const login = async ({
  email,
  password,
}: LoginSchema): Promise<ILoginResponce> => {
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

  return {
    token,
    refreshToken,
    user: {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    },
  };
};

// export const login = async ({
//   email,
//   password,
// }: LoginSchema): Promise<{ token: string; refreshToken: string }> => {
//   const userFind: IUserFind = {
//     email,
//   };
//   const user: UserDocument | null = await User.findOne(userFind);
//   if (!user) throw HttpExeption(401, `User with email ${email} not found`);

//   const passwordCompare: boolean = await bcrypt.compare(
//     password,
//     user.password
//   );
//   if (!passwordCompare) throw HttpExeption(401, "Password invalid");

//   const token: string = createToken(user);
//   const refreshToken: string = createRefreshToken(user);

//   user.token = token;
//   user.refreshToken = refreshToken;
//   await user.save();

//   return { token, refreshToken };
// };

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
