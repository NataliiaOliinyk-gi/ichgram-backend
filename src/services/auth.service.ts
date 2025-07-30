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
import generateRandomPassword from "../utils/generatePassword";

import { UserDocument } from "../db/models/User";
import { ILoginResponce } from "../controllers/auth.controller";
import {
  RegisterSchema,
  VerifyCodeSchema,
  LoginSchema,
  ResendVerifyEmailSchema,
  ForgotPasswordSchema,
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

// User Register

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
    html: `
    <p>Hello ${user.fullName},</p>
    <p>Thank you for registering with <strong>Ichgram</strong>.</p>
    <p>Please confirm your email address by clicking the link below:</p>
    <p><strong><a href="${FRONTEND_URL}?verificationCode=${verificationCode}" target="_blank">Confirm Email</a></strong></p>
    <p>If you did not sign up for this account, you can safely ignore this email.</p>
  `,
  };
  await sendEmail(verifyEmail);

  return user;
};

// Verify Email

export const verify = async (code: VerifyCodeSchema): Promise<void> => {
  const user: UserDocument | null = await User.findOne({
    verificationCode: code,
  });
  if (!user) throw HttpExeption(401, "Email already verified or not found");
  user.verificationCode = "";
  user.verify = true;
  await user.save();
};

// resend verify Email

export const resendVerifyEmail = async ({
  email,
}: ResendVerifyEmailSchema): Promise<UserDocument> => {
  const userFind: IUserFind = {
    email,
  };
  const user: UserDocument | null = await User.findOne(userFind);
  if (!user) throw HttpExeption(401, `User with email ${email} not found`);

  const verificationCode = nanoid();
  user.verificationCode = verificationCode;
  await user.save();

  const resendVerifyEmail = {
    to: [user.email],
    subject: "Resend Verify email",
    html: `
    <p>Hello ${user.fullName},</p>
    <p>You recently requested a new confirmation link for your <strong>Ichgram</strong> account.</p>
    <p>Please confirm your email address by clicking the link below:</p>
    <p><strong><a href="${FRONTEND_URL}?verificationCode=${verificationCode}" target="_blank">Confirm Email</a></strong></p>
    <p>If you already verified your email or did not request this link, you can safely ignore this message.</p>
  `,
  };
  await sendEmail(resendVerifyEmail);

  return user;
};

// User Login

export const login = async ({
  email,
  password,
}: LoginSchema): Promise<ILoginResponce> => {
  const userFind: IUserFind = {
    email,
  };
  const user: UserDocument | null = await User.findOne(userFind);
  if (!user) throw HttpExeption(401, `User with email ${email} not found`);

  if (!user.verify) throw HttpExeption(401, `Email not verified`);

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

// User forgot Password

export const forgotPassword = async ({
  email,
}: ForgotPasswordSchema): Promise<UserDocument> => {
  const userFind: IUserFind = {
    email,
  };
  const user: UserDocument | null = await User.findOne(userFind);
  if (!user) throw HttpExeption(401, `User with email ${email} not found`);

  const tempPassword = generateRandomPassword();
  const hashPassword: string = await bcrypt.hash(tempPassword, 10);
  user.password = hashPassword;
  await user.save();

  const resetEmail = {
    to: [user.email],
    subject: "Reset your password",
    html: `
    <p>Hello ${user.fullName},</p>
    <p>You requested a password reset. Here is your temporary password:</p>
    <p><strong>${tempPassword}</strong></p>
    <p>Please log in using this password and then change it in your account settings:</p>
    <p><strong><a href="${FRONTEND_URL}" target="_blank">Log in</a></strong></p>
    <p>If you have not requested this password, please ignore this email.</p>
  `,
  };
  await sendEmail(resetEmail);

  return user;
};

// refreshToken

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

// getCurrent перевірка, чи юзер залогінений

export const getCurrent = async (
  user: UserDocument
): Promise<ILoginResponce> => {
  const token: string = createToken(user);
  const refreshToken: string = createRefreshToken(user);
  user.token = token;
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    user: {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    },
  };
};

// User change Password

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

// User change Email

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

// User Logout

export const logout = async ({ _id }: UserDocument): Promise<boolean> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(401, `User not found`);
  user.token = "";
  user.refreshToken = "";

  await user.save();
  return true;
};

// User delete Account

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

// export const register = async (
//   payload: RegisterSchema
// ): Promise<UserDocument> => {
//   const hashPassword: string = await bcrypt.hash(payload.password, 10);

//   return User.create({
//     ...payload,
//     password: hashPassword,
//   });
// };

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
