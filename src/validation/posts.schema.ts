import * as Yup from "yup";

export const addPostSchema = Yup.object({
  userId: Yup.string(),
  text: Yup.string().trim().required(),
  photo: Yup.string(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type AddPostSchema = Yup.InferType<typeof addPostSchema>;


export const updatePostSchema = Yup.object({
  userId: Yup.string(),
  text: Yup.string().trim(),
  photo: Yup.string(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type UpdatePostSchema = Yup.InferType<typeof updatePostSchema>;