import mongoose from "mongoose";
import User from "../db/models/User";

export interface IFreshFollowCounts {
  targetFollowersCount: number;
  meFollowingCount: number;
}

const getFreshFollowCounts = async (
  targetId: string,
  meId: mongoose.Types.ObjectId
): Promise<IFreshFollowCounts> => {
  const [freshTarget] = await User.aggregate<{ followersCount?: number }>([
    { $match: { _id: new mongoose.Types.ObjectId(targetId) } },
    { $project: { followersCount: 1 } },
  ]);

  const [freshMe] = await User.aggregate<{ followingCount?: number }>([
    { $match: { _id: meId } },
    { $project: { followingCount: 1 } },
  ]);

    return {
    targetFollowersCount: freshTarget?.followersCount ?? 0,
    meFollowingCount: freshMe?.followingCount ?? 0,
  };
};

export default getFreshFollowCounts;