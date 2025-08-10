import Like from "../db/models/Like";
import User from "../db/models/User";
import Post from "../db/models/Post";
import HttpExeption from "../utils/HttpExeption";

import { UserDocument } from "../db/models/User";
import { AddLikeSchema } from "../validation/likes.schema";

interface IToggleLike {
  postId: AddLikeSchema;
}

export const toggleLike = async (
  postId: IToggleLike,
  { _id }: UserDocument
): Promise<{ liked: boolean; likesCount: number }> => {
  const userId = _id;
  const user: UserDocument | null = await User.findById(userId);
  if (!user) throw HttpExeption(404, `User not found`);

  const post = await Post.findById(postId);
  if (!post) throw HttpExeption(404, `Post with id=${postId} not found`);

  // Перевірка, чи лайк уже є
  const existingLike = await Like.findOne({ postId, userId });

  // Якщо є — видаляємо
  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    const likesCount = await Like.countDocuments({ postId });
    return { liked: false, likesCount };
  }

  // Якщо немає — створюємо
  await Like.create({
    userId,
    postId,
  });
  const likesCount = await Like.countDocuments({ postId });
  return {
    liked: true,
    likesCount,
  };
};
