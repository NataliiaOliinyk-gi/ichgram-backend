import Comment from "../db/models/Comment";
import Post from "../db/models/Post";
import Notification from "../db/models/Notification";

import HttpExeption from "../utils/HttpExeption";

import { UserDocument } from "../db/models/User";
import { CommentDocument } from "../db/models/Comment";

import {
  AddCommentSchema,
  UpdateCommentSchema,
} from "../validation/comments.schema";

export const addCommentByPostId = async (
  postId: string,
  payload: AddCommentSchema,
  { _id: userId }: UserDocument
): Promise<CommentDocument> => {
  const post = await Post.findById({ _id: postId });
  if (!post) throw HttpExeption(404, "Post not found");

  const comment = await Comment.create({ postId, userId, text: payload.text });

  // інкремент лічильника коментарів без зміни updatedAt
  await Post.updateOne(
    { _id: postId },
    { $inc: { commentsCount: 1 } },
    { timestamps: false }
  );

  // підтягуємо автора
  await comment.populate("userId", "username fullName profilePhoto");

  // створюємо повідомлення
  await Notification.create({
    recipientId: post.userId, // автор поста
    senderId: userId,
    type: "comment",
    postId: postId,
    commentId: comment._id,
  });

  return comment;
};

export const updateCommentById = async (
  commentId: string,
  payload: UpdateCommentSchema,
  { _id: userId }: UserDocument
): Promise<CommentDocument> => {
  const comment = await Comment.findOne({ _id: commentId, userId });
  if (!comment) throw HttpExeption(404, "Comment not found or access denied");

  comment.text = payload.text;
  await comment.save();

  return comment;
};

export const deleteCommentById = async (
  commentId: string,
  { _id: userId }: UserDocument
): Promise<CommentDocument> => {
  const comment = await Comment.findOne({ _id: commentId, userId });
  if (!comment) throw HttpExeption(404, "Comment not found or access denied");

  await comment.deleteOne();

  // декремент лічильника без зміни updatedAt
  await Post.updateOne(
    { _id: comment.postId },
    { $inc: { commentsCount: -1 } },
    { timestamps: false }
  );

  return comment;
};

interface ICommentsQuery {
  page: number;
  limit: number;
}

export const getCommentsByPostId = async (
  postId: string,
  { page, limit }: ICommentsQuery
): Promise<{
  comments: CommentDocument[];
  page: number;
  limit: number;
  hasMore: boolean;
}> => {
  const skip = (page - 1) * limit;

  // Трюк з limit+1, щоб визначити hasMore без зайвого count()
  const items = await Comment.find({ postId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate("userId", "username fullName profilePhoto")
    .select("postId userId text createdAt updatedAt")
    .lean<CommentDocument[]>();

  const hasMore = items.length > limit;
  if (hasMore) items.pop(); // прибираємо зайвий елемент

  return {
    comments: items,
    page,
    limit,
    hasMore,
  };
};
