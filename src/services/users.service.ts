import mongoose from "mongoose";
import User from "../db/models/User";
import Follow from "../db/models/Follow";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument, PublicUserResponse } from "../db/models/User";
import { toPublicUserResponse } from "../utils/user.mapper";

type WithFollowFlag = PublicUserResponse & {
  isFollowedByCurrentUser: boolean;
};

export interface ISearchUsersOptions {
  page: number;
  limit: number;
}

export interface ISearchResultResponse {
  users: WithFollowFlag[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IListOptions {
  targetUserId: string; // для кого дивимось фоловерів/підписок
  currentUserId: mongoose.Types.ObjectId; // хто робить запит (щоб порахувати isFollowedByCurrentUser)
  page: number;
  limit: number;
}

export interface IPaginatedUsers {
  users: WithFollowFlag[];
  page: number;
  limit: number;
  hasMore: boolean;
}

// --------- HELPERS ---------
const ensureUserExists = async (id: string | mongoose.Types.ObjectId) => {
  const user = await User.findById(id);
  if (!user) throw HttpExeption(404, "User not found");
  return user;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const baseUserProjection = {
  _id: 1,
  email: 1,
  fullName: 1,
  username: 1,
  biography: 1,
  profilePhoto: 1,
  website: 1,
  verify: 1,
  followersCount: 1,
  followingCount: 1,
};

// --------- SEARCH ---------

export const searchUsers = async (
  q: string,
  { _id: currentUserId }: UserDocument,
  { page, limit }: ISearchUsersOptions
): Promise<ISearchResultResponse> => {
  // const currentUser = await User.findById(currentUserId);
  // if (!currentUser) throw HttpExeption(404, "User not found");
  await ensureUserExists(currentUserId);

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
    { $project: baseUserProjection },
  ];

  // const items = await User.aggregate<IUserResponse>(pipeline).exec();
  const items = await User.aggregate<WithFollowFlag>(pipeline).exec();
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
): Promise<WithFollowFlag> => {
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

// --------- FOLLOWERS ---------
// список людей, які підписані на targetUserId

export const getFollowers = async ({
  targetUserId,
  currentUserId,
  page,
  limit,
}: IListOptions): Promise<IPaginatedUsers> => {
  await ensureUserExists(targetUserId);

  const skip = (page - 1) * limit;
  const target = new mongoose.Types.ObjectId(targetUserId);

  const pipeline: any[] = [
    // хто підписаний на target
    { $match: { followingId: target } },
    // підтягнути самих юзерів (фоловерів)
    {
      $lookup: {
        from: "users",
        localField: "followerId",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: baseUserProjection }],
      },
    },
    { $unwind: "$user" },
    // прапор "я підписаний на цього юзера?"
    {
      $lookup: {
        from: "follows",
        let: { listedUserId: "$user._id", me: currentUserId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$followerId", "$$me"] },
                  { $eq: ["$followingId", "$$listedUserId"] },
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
    // сортування: популярніші вище, потім username
    { $sort: { "user.followersCount": -1, "user.username": 1 } },
    // пагінація
    { $skip: skip },
    { $limit: limit + 1 },
    // привести до плоского вигляду
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$user",
            { isFollowedByCurrentUser: "$isFollowedByCurrentUser" },
          ],
        },
      },
    },
  ];

  const items = await Follow.aggregate<WithFollowFlag>(pipeline).exec();
  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  return {
    users: items,
    page,
    limit,
    hasMore,
  };
};

// --------- FOLLOWING ---------
// список людей, на кого підписаний targetUserId
export const getFollowing = async ({
  targetUserId,
  currentUserId,
  page,
  limit,
}: IListOptions): Promise<IPaginatedUsers> => {
  await ensureUserExists(targetUserId);

  const skip = (page - 1) * limit;
  const target = new mongoose.Types.ObjectId(targetUserId);

  const pipeline: any[] = [
    // знаходимо на кого підписаний target
    { $match: { followerId: target } },
    // підтягнути самих юзерів (ті, на кого підписаний)
    {
      $lookup: {
        from: "users",
        localField: "followingId",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: baseUserProjection }],
      },
    },
    { $unwind: "$user" },
    // прапор "я підписаний на цього юзера?"
    {
      $lookup: {
        from: "follows",
        let: { listedUserId: "$user._id", me: currentUserId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$followerId", "$$me"] },
                  { $eq: ["$followingId", "$$listedUserId"] },
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
    // сортування і пагінація
    { $sort: { "user.followersCount": -1, "user.username": 1 } },
    { $skip: skip },
    { $limit: limit + 1 },
    // привести до плоского вигляду
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$user",
            { isFollowedByCurrentUser: "$isFollowedByCurrentUser" },
          ],
        },
      },
    },
  ];

  const items = await Follow.aggregate<WithFollowFlag>(pipeline).exec();
  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  return {
    users: items,
    page,
    limit,
    hasMore,
  };
};

// --------- USERS ---------
export const getUsersService = async ({ _id: currentUserId }: UserDocument) => {
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("username fullName profilePhoto")
    .lean();

  const followed = await Follow.find({ followerId: currentUserId })
    .select("followingId")
    .lean();
  const followedIds = new Set(followed.map((f) => f.followingId.toString()));

  return users.map((user) => ({
    ...user,
    isFollowedByCurrentUser: followedIds.has(user._id.toString()),
  }));
};
