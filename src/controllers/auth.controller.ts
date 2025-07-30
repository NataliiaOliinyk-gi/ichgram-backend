import { Request, Response } from "express";

import * as authService from "../services/auth.service";

import validateBody from "../utils/validateBody";
import HttpExeption from "../utils/HttpExeption";

import {
  registerSchema,
  verifyCodeSchema,
  loginSchema,
  resendVerifyEmailSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
} from "../validation/auth.schema";
import { UserDocument } from "../db/models/User";
import { AuthenticatedRequest } from "../typescript/interfaces";

export interface ILoginResponce {
  token: string;
  refreshToken?: string;
  user: {
    email: string;
    fullName: string;
    username: string;
  };
}

// User Register

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(registerSchema, req.body);

  const result: UserDocument = await authService.register(req.body);

  res.status(201).json({
    message: `Welcome! You have successfully registered with the email ${result.email}. \nPlease confirm your email by clicking the link sent to your inbox.`,
  });
};

// Verify Email

export const verifyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(verifyCodeSchema, req.body);
  await authService.verify(req.body.code);

  res.json({
    message:
      "Email successfully verified. \nPlease login with your credentials.",
  });
};

// resend verify Email

export const resendVerifyEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(resendVerifyEmailSchema, req.body);

  const result: UserDocument = await authService.resendVerifyEmail(req.body);

  res.json({
    message: `We've sent a new confirmation link to ${result.email}. Please check your inbox to complete the verification.`,
  });
};

// User Login

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(loginSchema, req.body);

  const result: ILoginResponce = await authService.login(req.body);

  const token = result.token;
  const refreshToken = result.refreshToken;
  const user = result.user;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // захищено від JS
    secure: true, // лише по HTTPS
    sameSite: "strict",
    path: "/",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
  });

  res.json({ token, user });
};

// User forgot Password

export const forgotPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(forgotPasswordSchema, req.body);

  const result: UserDocument = await authService.forgotPassword(req.body);

  res.json({
    message: `An email ${result.email} with a temporary password has been sent. Please follow the instructions in the email.`,
  });
};

// refreshToken

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) throw HttpExeption(401, "Refresh token missing");

  const { token, refreshToken } = await authService.refreshToken(
    oldRefreshToken
  );

  // Зберігаємо новий refreshToken у cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: "strict", // захист від CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
  });

  res.json({ token });
};

// getCurrent перевірка, чи юзер залогінений

export const getCurrentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result: ILoginResponce = await authService.getCurrent(
    (req as AuthenticatedRequest).user
  );

  const token = result.token;
  const user = result.user;

  res.json({ token, user });
};

// User change Password

export const changePasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(changePasswordSchema, req.body);

  await authService.changePassword(
    req.body,
    (req as AuthenticatedRequest).user
  );

  res.json({
    message: "Password change successfully",
  });
};

// User change Email

export const changeEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(changeEmailSchema, req.body);

  const result = await authService.changeEmail(
    req.body,
    (req as AuthenticatedRequest).user
  );

  res.json({
    message: `Email ${result} update successfully`,
  });
};

// User Logout

export const logoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await authService.logout((req as AuthenticatedRequest).user);

  res.json({
    message: "Logout successfully",
  });
};

// User delete Account

export const deleteAccountController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(deleteAccountSchema, req.body);

  await authService.deleteAccount(req.body, (req as AuthenticatedRequest).user);

  res.json({
    message: "User delete successfully",
  });
};

// export const loginController = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   await validateBody(loginSchema, req.body);

//   // const token: string = await authService.login(req.body);
//   // res.json({ token });

//   const { token, refreshToken } = await authService.login(req.body);

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true, // захищено від JS
//     secure: true, // лише по HTTPS
//     sameSite: "strict",
//     path: "/",
//     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
//   });

//   res.json({ token });
// };

// export const getCurrentController = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const token: string = await authService.getCurrent(
//     (req as AuthenticatedRequest).user
//   );
//   res.json({ token });
// };
