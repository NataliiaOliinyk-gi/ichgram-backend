import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks";

interface IFollow {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
}

export type FollowDocument = IFollow & Document<Types.ObjectId>;

const FollowSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

// Забороняємо дубль однієї пари
FollowSchema.index(
  { followerId: 1, followingId: 1 },
  { unique: true, name: "uniq_follow" }
);
// Швидкий пошук підписок користувача
FollowSchema.index({ followerId: 1 }, { name: "by_follower" });
// Швидкий пошук фоловерів користувача
FollowSchema.index({ followingId: 1 }, { name: "by_following" });

FollowSchema.post("save", handleSaveError);
FollowSchema.pre("findOneAndUpdate", setUpdateSettings);
FollowSchema.post("findOneAndUpdate", handleSaveError);

const Follow = model<IFollow>("follow", FollowSchema);

export default Follow;
