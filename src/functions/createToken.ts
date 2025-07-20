import jwt from "jsonwebtoken";

import { UserDocument } from "../db/models/User";

export interface IJWTTokenPayload {
  id: string | unknown;
}

const { JWT_SECRET } = process.env;
if (typeof JWT_SECRET !== "string") throw new Error("JWT_SECRET not found");

const createToken = (user: UserDocument): string => {
  const payload: IJWTTokenPayload = {
    id: user._id,
  };
  const token: string = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  return token;
};

export default createToken;
