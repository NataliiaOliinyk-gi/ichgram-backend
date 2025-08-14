import User, { UserDocument } from "../db/models/User";

import HttpExeption from "../utils/HttpExeption";

import { verifyToken } from "../functions/jsonwebtoken";

export async function getUserByBearer(
  authorization?: string
): Promise<UserDocument> {
  if (!authorization) throw HttpExeption(401, "Authorization header missing");

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer" || !token) throw HttpExeption(401, "Bearer missing");

  const id = verifyToken(token);

  const user: UserDocument | null = await User.findById(id);
  if (!user || !user.token || user.token !== token)
    throw HttpExeption(401, "User not found or token mismatch");

  return user;
}
