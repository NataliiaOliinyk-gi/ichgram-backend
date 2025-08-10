import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks";

interface ILike {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}

export type LikeDocument = ILike & Document<Types.ObjectId>;

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

// --- Indexes ---
// 1) Забороняє дублікати лайка від того ж користувача на той самий пост
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true, name: "uniq_post_user" });
// 2) Швидкі вибірки всіх лайків поста (наприклад, для $in по списку постів)
LikeSchema.index({ postId: 1 }, { name: "by_post" });
// 3) Швидко дістати всі лайки користувача (наприклад, для профілю)
LikeSchema.index({ userId: 1 }, { name: "by_user" });

LikeSchema.post("save", handleSaveError);
LikeSchema.pre("findOneAndUpdate", setUpdateSettings);
LikeSchema.post("findOneAndUpdate", handleSaveError);

const Like = model<ILike>("like", LikeSchema);

export default Like;
