import { Types } from "mongoose";
import Like from "../db/models/Like";
import { IPostForLean } from "../db/models/Post";
import { IPostResponse } from "../services/posts.service";

const markPostsWithUserLikes = async (
  posts: IPostForLean[],
  userId: Types.ObjectId
): Promise<IPostResponse[]> => {
  if (posts.length === 0) {
    return posts.map((post) => ({ ...post, isLikedByCurrentUser: false }));
  }

  const postIds = posts.map((p) => p._id);

  // витягуємо лише postId, спираємось на індекс { userId: 1, postId: 1 }
  const likedPostIds = await Like.distinct("postId", {
    userId,
    postId: { $in: postIds },
  });

  const likedSet = new Set(likedPostIds.map((id) => String(id)));

  return posts.map((post) => ({
    ...post,
    isLikedByCurrentUser: likedSet.has(String(post._id)),
  }));
};

export default markPostsWithUserLikes;


  // const postIds = posts.map((item) => item._id);
  // const liked = await Like.find(
  //   { userId: _id, postId: { $in: postIds } },
  //   { postId: 1, _id: 0 }
  // ).lean();

  // const likedSet = new Set(liked.map((item) => String(item.postId)));

  // const result = posts.map((post) => ({
  //   ...post,
  //   isLikedByCurrentUser: likedSet.has(String(post._id)),
  // }));

  // return result;
