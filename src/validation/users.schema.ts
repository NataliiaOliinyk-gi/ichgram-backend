import * as Yup from "yup";

export const updateUserSchema = Yup.object({
  fullName: Yup.string().trim(),
  username: Yup.string().trim(),
  biography: Yup.string(),
  profilePhoto: Yup.string(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type UpdateUserSchema = Yup.InferType<typeof updateUserSchema>;
