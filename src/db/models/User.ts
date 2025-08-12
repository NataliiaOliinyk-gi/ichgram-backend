import { Schema, model, Document, Types } from "mongoose";

import { emailValidation } from "../../constants/user.constants";
import { handleSaveError, setUpdateSettings } from "../hooks";

interface IUser {
  email: string;
  fullName: string;
  username: string;
  password: string;
  token?: string;
  refreshToken?: string;
  biography?: string;
  profilePhoto?: string;
  website?: string;
  verificationCode?: string;
  verify: boolean;
  followersCount: number;
  followingCount: number;
}

export type UserDocument = IUser & Document<Types.ObjectId>;
export type PublicUserResponse = Omit<
  IUser,
  "password" | "token" | "refreshToken" | "verificationCode"
> & {
  _id: string;
};

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      match: emailValidation.value,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    biography: {
      type: String,
    },
    website: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    verificationCode: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
      required: true,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);

UserSchema.post("save", handleSaveError);
UserSchema.pre("findOneAndUpdate", setUpdateSettings);
UserSchema.post("findOneAndUpdate", handleSaveError);

const User = model<IUser>("user", UserSchema);

export default User;
