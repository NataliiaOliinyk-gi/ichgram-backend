import mongoose from "mongoose";
import User from "../db/models/User";
import Follow from "../db/models/Follow";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument, PublicUserResponse } from "../db/models/User";
import { toPublicUserResponse } from "../utils/user.mapper";

export interface IUserResponse extends PublicUserResponse {
  isFollowedByCurrentUser: boolean;
}

export interface ISearchUsersOptions {
  page: number;
  limit: number;
}

export interface ISearchResultResponse {
  users: IUserResponse[];
  page: number;
  limit: number;
  hasMore: boolean;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchUsers = async (
  q: string,
  { _id: currentUserId }: UserDocument,
  { page, limit }: ISearchUsersOptions
): Promise<ISearchResultResponse> => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) throw HttpExeption(404, "User not found");

  const rx = escapeRegex(q); // префіксний пошук (користується індексом)

  const matchStage: any = {
    $and: [
      // виключаємо себе
      { _id: { $ne: currentUserId } },
      // ім’я або нікнейм по префіксу
      {
        $or: [
          { username: { $regex: rx, $options: "i" } },
          { fullName: { $regex: rx, $options: "i" } },
        ],
      },
    ],
  };

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: matchStage },

    // прапор "чи я підписаний на цього юзера"
    {
      $lookup: {
        from: "follows",
        let: { targetId: "$_id", me: currentUserId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$followerId", "$$me"] },
                  { $eq: ["$followingId", "$$targetId"] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "followEdge",
      },
    },
    {
      $addFields: {
        isFollowedByCurrentUser: { $gt: [{ $size: "$followEdge" }, 0] },
      },
    },

    // сортування — спершу популярні, потім нік
    { $sort: { followersCount: -1, username: 1 } },

    // пагінація
    { $skip: skip },
    { $limit: limit + 1 },

    // мінімізуємо відповідь
    {
      $project: {
        _id: 1,
        email: 1,
        fullName: 1,
        username: 1,
        biography: 1,
        profilePhoto: 1,
        website: 1,
        followersCount: 1,
        followingCount: 1,
        isFollowedByCurrentUser: 1,
      },
    },
  ];

  const items = await User.aggregate<IUserResponse>(pipeline).exec();

  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  return {
    users: items,
    page,
    limit,
    hasMore,
  };
};

export const getUserById = async (
  id: string,
  { _id: currentUserId }: UserDocument
): Promise<IUserResponse> => {
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
