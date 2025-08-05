import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks";

interface IPost {
    // userId: typeof Schema.Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  photo: string;
}

export type PostDocument = IPost & Document<Types.ObjectId>;

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
      match: /\.(jpg|jpeg|png|webp|gif)$/i,
    },
  },
  { versionKey: false, timestamps: true }
);

PostSchema.post("save", handleSaveError);
PostSchema.pre("findOneAndUpdate", setUpdateSettings);
PostSchema.post("findOneAndUpdate", handleSaveError);

const Post = model<IPost>("post", PostSchema);

export default Post;
