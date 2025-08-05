import * as Yup from "yup";

export const addPostSchema = Yup.object({
  userId: Yup.string().trim(),
  text: Yup.string().trim().required(),
  photo: Yup.string(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type AddPostSchema = Yup.InferType<typeof addPostSchema>;
