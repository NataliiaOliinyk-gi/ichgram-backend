import { Request, Response } from "express";

import * as authService from "../services/auth.service";

import validateBody from "../utils/validateBody";
import HttpExeption from "../utils/HttpExeption";

import { registerSchema, loginSchema } from "../validation/auth.schema";
import { UserDocument } from "../db/models/User";
import { AuthenticatedRequest } from "../typescript/interfaces";

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(registerSchema, req.body);

  const result: UserDocument = await authService.register(req.body);

  res.status(201).json({
    message: `User with email ${result.email} has been successfully registered.`,
  });
};

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await validateBody(loginSchema, req.body);

  const token: string = await authService.login(req.body);

  res.json({ token });
};

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

export const logoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  await authService.logout((req as AuthenticatedRequest).user);

  res.json({
    message: "Logout successfully",
  });
};
