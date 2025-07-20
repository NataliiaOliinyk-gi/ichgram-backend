import jwt from "jsonwebtoken";

import HttpExeption from "../utils/HttpExeption";

import { UserDocument } from "../db/models/User";

export interface IJWTTokenPayload {
  id: string | unknown;
}

const { JWT_SECRET } = process.env;
if (typeof JWT_SECRET !== "string")
  throw HttpExeption(500, "JWT_SECRET not found");

export const createToken = (user: UserDocument): string => {
  const payload: IJWTTokenPayload = {
    id: user._id,
  };
  const token: string = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  return token;
};

export const verifyToken = (token: string) => {
  const { id } = jwt.verify(token, JWT_SECRET) as IJWTTokenPayload;
  return id;
};
