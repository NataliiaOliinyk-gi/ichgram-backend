import { Schema, model, Document } from "mongoose";

import { emailValidation } from "../../constants/user.constants";
import { handleSaveError, setUpdateSettings } from "../hooks";

interface IUser {
  email: string;
  fullName: string;
  username: string;
  password: string;
  token?: string;
  biography?: string;
  profilePhoto?: string;
}

export type UserDocument = IUser & Document;

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
    biography: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

UserSchema.post("save", handleSaveError);
UserSchema.pre("findOneAndUpdate", setUpdateSettings);
UserSchema.post("findOneAndUpdate", handleSaveError);

const User = model<IUser>("user", UserSchema);

export default User;

// User.create({
//   email: "nata@gmail.com",
//   fullName: "Nata",
//   username: "natali",
//   password: "123456Nata!",
// });
