import mongoose from "mongoose";
import User from "../db/models/User";
import Follow from "../db/models/Follow";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument, PublicUserResponse } from "../db/models/User";
import { toPublicUserResponse } from "../utils/user.mapper";

export interface IUserByIdResponse extends PublicUserResponse {
  isFollowedByCurrentUser: boolean;
}

export const getUserById = async (
  id: string,
  { _id: currentUserId }: UserDocument
): Promise<IUserByIdResponse> => {
  const user: UserDocument | null = await User.findById(id);
  if (!user) throw HttpExeption(404, `User not found`);

  // перевіряємо, чи підписаний поточний користувач на цього
  let isFollowedByCurrentUser = false;
  if (!currentUserId.equals(user._id)) {
    const followExists = await Follow.exists({
      followerId: currentUserId,
      followingId: user._id,
    });
    isFollowedByCurrentUser = Boolean(followExists);
  }

  const responceUser = toPublicUserResponse(user);
  return {
    ...responceUser,
    isFollowedByCurrentUser,
  };
};
