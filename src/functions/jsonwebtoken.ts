import jwt from "jsonwebtoken";

import HttpExeption from "../utils/HttpExeption";

import { UserDocument } from "../db/models/User";

export interface IJWTTokenPayload {
  id: string;
}

const { JWT_SECRET } = process.env;
if (typeof JWT_SECRET !== "string")
  throw HttpExeption(500, "JWT_SECRET not found");

const { JWT_REFRESH_SECRET } = process.env;
if (typeof JWT_REFRESH_SECRET !== "string")
  throw HttpExeption(500, "JWT_REFRESH_SECRET not found");

export const createToken = (user: UserDocument): string => {
  const payload: IJWTTokenPayload = {
    id: user._id.toString(),
  };
  const token: string = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  return token;
};

export const createRefreshToken = (user: UserDocument): string => {
  const payload: IJWTTokenPayload = {
    id: user._id.toString(),
  };
  const refreshToken: string = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
};

export const verifyToken = (token: string): string => {
  const { id } = jwt.verify(token, JWT_SECRET) as IJWTTokenPayload;
  return id;
};

export const verifyRefreshToken = (token: string): string => {
  const { id } = jwt.verify(token, JWT_REFRESH_SECRET) as IJWTTokenPayload;
  return id;
};
