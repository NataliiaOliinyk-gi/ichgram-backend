import { unlink } from "node:fs/promises";

import Post from "../db/models/Post";
import User from "../db/models/User";
import Follow from "../db/models/Follow";
import Like from "../db/models/Like";

import HttpExeption from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";
import markPostsWithUserLikes from "../utils/markPostsWithUserLikes";

import { UserDocument } from "../db/models/User";
import { PostDocument, IPostForLean } from "../db/models/Post";
import { AddPostSchema, UpdatePostSchema } from "../validation/posts.schema";

export interface IPostResponse extends IPostForLean {
  isLikedByCurrentUser: boolean;
}

interface IAddPost {
  payload: AddPostSchema;
  file: Express.Multer.File | undefined;
}

interface IUpdatePost {
  payload?: UpdatePostSchema;
  file?: Express.Multer.File | undefined;
}

export const addPost = async (
  { payload, file }: IAddPost,
  { _id }: UserDocument
): Promise<PostDocument> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  let photo: string = "";
  if (file) {
    const { url: image } = await cloudinary.uploader.upload(file.path, {
      folder: "ichgram",
      use_filename: true, // не переименовывать файл, не обязательная настройка
    });
    await unlink(file.path); // удалить файл из папки temp
    photo = image;
  }

  const post = await Post.create({
    userId: _id,
    text: payload.text,
    photo,
  });

  return post;
};

export const getPosts = async ({
  _id,
}: UserDocument): Promise<IPostResponse[]> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const followingIds = await Follow.distinct("followingId", {
    followerId: _id,
  });

  // або від підписок мінус свої, або від всіх мінус свої
  const filter =
    followingIds.length > 0
      ? { userId: { $in: followingIds, $ne: _id } }
      : { userId: { $ne: _id } };

  const posts = await Post.find(filter)
    .populate("userId", "username fullName profilePhoto followersCount")
    .sort({ updatedAt: -1 })
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean[]>();

  // прапор лайку
  const withLikes = await markPostsWithUserLikes(posts, _id);

  //прапор підписки на автора
  const followingSet = new Set(followingIds.map(String));
  const result = withLikes.map((post) => ({
    ...post,
    isAuthorFollowedByCurrentUser:
      followingSet.size > 0 && followingSet.has(String(post.userId._id)), // автор у сеті моїх підписок
  }));

  return result;
};

export const getMyPosts = async ({
  _id,
}: UserDocument): Promise<IPostResponse[]> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const posts = await Post.find({ userId: _id })
    .populate("userId", "username fullName profilePhoto")
    .sort({ updatedAt: -1 })
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean[]>();

  return await markPostsWithUserLikes(posts, _id);
};

export const getPostsByUser = async (
  id: string,
  currentUser: UserDocument
): Promise<IPostResponse[]> => {
  const user: UserDocument | null = await User.findById(id);
  if (!user) throw HttpExeption(401, `User not found`);

  const posts = await Post.find({ userId: id })
    .populate("userId", "username fullName profilePhoto")
    .sort({ updatedAt: -1 })
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean[]>();

  // return await markPostsWithUserLikes(posts, currentUser._id);
  // прапор лайку
  const withLikes = await markPostsWithUserLikes(posts, currentUser._id);

  //прапор підписки на автора
  const followingIds = await Follow.distinct("followingId", {
    followerId: currentUser._id,
  });
  const followingSet = new Set(followingIds.map(String));
  const result = withLikes.map((post) => ({
    ...post,
    isAuthorFollowedByCurrentUser:
      followingSet.size > 0 && followingSet.has(String(post.userId._id)), // автор у сеті моїх підписок
  }));

  return result;
};

export const getPostById = async (
  id: string,
  { _id: me }: UserDocument
): Promise<IPostResponse> => {
  const post = await Post.findById(id)
    .populate("userId", "username fullName profilePhoto")
    .select("userId text photo likesCount commentsCount createdAt updatedAt")
    .lean<IPostForLean>();

  if (!post) throw HttpExeption(404, `Post not found`);

  let isLikedByCurrentUser = false;
  const exists = await Like.exists({ postId: post._id, userId: me });
  isLikedByCurrentUser = Boolean(exists);

  return {
    ...post,
    isLikedByCurrentUser: Boolean(exists),
  };
};

export const updatePost = async (
  id: string,
  { payload, file }: IUpdatePost,
  { _id }: UserDocument
): Promise<PostDocument> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const post: PostDocument | null = await Post.findById(id).select(
    "userId text photo likesCount commentsCount createdAt updatedAt"
  );
  if (!post) throw HttpExeption(404, `Post not found`);

  if (!post.userId.equals(_id))
    throw HttpExeption(
      403,
      `Permission denied: You are not the author of this post`
    );

  if (file) {
    const { url: image } = await cloudinary.uploader.upload(file.path, {
      folder: "ichgram",
      use_filename: true,
    });
    await unlink(file.path);
    post.photo = image;
  }
  if (payload?.text) post.text = payload.text;

  await post.save();

  return post;
};

export const deletePost = async (
  id: string,
  { _id }: UserDocument
): Promise<PostDocument> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const post: PostDocument | null = await Post.findById(id);
  if (!post) throw HttpExeption(404, `Post not found`);

  if (!post.userId.equals(_id))
    throw HttpExeption(
      403,
      `Permission denied: You are not the author of this post`
    );

  await post.deleteOne();

  return post;
};

export const getExplorePosts = async (
  { _id }: UserDocument,
  count: number
): Promise<IPostResponse[]> => {
  const currentUser: UserDocument | null = await User.findById(_id);
  if (!currentUser) throw HttpExeption(404, `User not found`);

  // на кого підписаний
  const followingIds = await Follow.distinct("followingId", {
    followerId: _id,
  });

  const pipeline: any[] = [
    // не показуємо власні пости
    { $match: { userId: { $ne: _id } } },
    // (виключити тих, на кого підписаний)
    { $match: { userId: { $nin: followingIds } } },
    // випадкові
    { $sample: { size: count } },
    // підтягнути автора
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { username: 1, profilePhoto: 1 } }],
      },
    },
    { $unwind: "$user" },
    // прапор "лайкнув чи ні поточний user"
    {
      $lookup: {
        from: "likes",
        let: { postId: "$_id", userId: _id },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$postId", "$$postId"] },
                  { $eq: ["$userId", "$$userId"] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "likedByMe",
      },
    },
    {
      $addFields: {
        isLikedByCurrentUser: { $gt: [{ $size: "$likedByMe" }, 0] },
      },
    },
    // віддати фронтенду
    {
      $project: {
        _id: 1,
        text: 1,
        photo: 1,
        likesCount: 1,
        commentsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        userId: {
          _id: "$user._id",
          username: "$user.username",
          profilePhoto: "$user.profilePhoto",
        },
        isLikedByCurrentUser: 1,
      },
    },
  ];

  const items = await Post.aggregate<IPostResponse>(pipeline).exec();
  return items;
};
