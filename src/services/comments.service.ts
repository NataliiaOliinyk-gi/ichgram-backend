// services/comments.service.ts (псевдокод)
import Comment from "../db/models/Comment";
import Post from "../db/models/Post";

export const addComment = async (
  postId: string,
  { _id: userId }: UserDocument,
  text: string
) => {
  const comment = await Comment.create({ postId, userId, text });
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }, { new: false });
  return comment;
};

export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw HttpExeption(404, "Comment not found");
  if (!comment.userId.equals(userId)) throw HttpExeption(403, "Permission denied");

  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
  return { ok: true };
};