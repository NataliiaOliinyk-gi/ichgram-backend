import * as Yup from "yup";
import mongoose from "mongoose";

export const followUserSchema = Yup.object({
  targetId: Yup.string()
    .required()
    .test("is-objectid", "Invalid targetId", (value) =>
      mongoose.Types.ObjectId.isValid(value)
    ),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type FollowUserSchema = Yup.InferType<typeof followUserSchema>;
