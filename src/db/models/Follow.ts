import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks";

interface IFollow {
  userId: Types.ObjectId;
  followId: Types.ObjectId;
}

export type FollowDocument = IFollow & Document<Types.ObjectId>;

const FollowSchema = new Schema<IFollow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    followId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

FollowSchema.post("save", handleSaveError);
FollowSchema.pre("findOneAndUpdate", setUpdateSettings);
FollowSchema.post("findOneAndUpdate", handleSaveError);

const Follow = model<IFollow>("follow", FollowSchema);

export default Follow;