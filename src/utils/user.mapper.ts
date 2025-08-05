import { UserDocument, PublicUserResponse } from "../db/models/User";

export const toPublicUserResponse = (
  user: UserDocument
): PublicUserResponse => {
  const {
    _id,
    email,
    fullName,
    username,
    biography,
    profilePhoto,
    website,
    verify,
  } = user;

  return {
    _id: _id.toString(),
    email,
    fullName,
    username,
    biography,
    profilePhoto,
    website,
    verify,
  };
};
