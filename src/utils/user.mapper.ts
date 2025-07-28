import { UserDocument, PublicUserResponse } from "../db/models/User";

export const toPublicUserResponse = (
  user: UserDocument
): PublicUserResponse => {
  const {
    email,
    fullName,
    username,
    biography,
    profilePhoto,
    verify,
    createdAt,
    updatedAt,
  } = user;

  return {
    email,
    fullName,
    username,
    biography,
    profilePhoto,
    verify,
    createdAt,
    updatedAt,
  };
};
