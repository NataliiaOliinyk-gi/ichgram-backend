import User from "../db/models/User";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument, PublicUserResponse } from "../db/models/User";
import { toPublicUserResponse } from "../utils/user.mapper";

export const getUserById = async (id: string): Promise<PublicUserResponse> => {
  const user: UserDocument | null = await User.findById(id);
  if (!user) throw HttpExeption(401, `User not found`);

  const responceUser = toPublicUserResponse(user);
  return responceUser;
};
