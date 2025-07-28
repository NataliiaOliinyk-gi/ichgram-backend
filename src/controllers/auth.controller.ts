import { Request, Response } from "express";

import * as authService from "../services/auth.service";

import validateBody from "../utils/validateBody";
import HttpExeption from "../utils/HttpExeption";

import {
  registerSchema,
  verifyCodeSchema,
  loginSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
} from "../validation/auth.schema";
import { UserDocument } from "../db/models/User";
import { AuthenticatedRequest } from "../typescript/interfaces";

export interface ILoginResponce {
  token: string;
  refreshToken: string;
  user: {
    email: string;
    fullName: string;
    username: string;
  };
}

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(registerSchema, req.body);

  const result: UserDocument = await authService.register(req.body);

  res.status(201).json({
    message: `User with email ${result.email} has been successfully registered. Please confirm email with link`,
  });
};

export const verifyController = async(req: Request, res: Response)=> {
  await validateBody(verifyCodeSchema, req.body);
  await authService.verify(req.body.code);

  res.json({
    message: "User successfully verify"
  })
};

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

export const getCurrentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token: string = await authService.getCurrent(
    (req as AuthenticatedRequest).user
  );
  res.json({ token });
};

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

export const logoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await authService.logout((req as AuthenticatedRequest).user);

  res.json({
    message: "Logout successfully",
  });
};

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
