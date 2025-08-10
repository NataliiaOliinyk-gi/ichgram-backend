import * as Yup from "yup";

export const addCommentSchema = Yup.object({
  text: Yup.string().required(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type AddCommentSchema = Yup.InferType<typeof addCommentSchema>;

export const updateCommentSchema = Yup.object({
  text: Yup.string().required(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type UpdateCommentSchema = Yup.InferType<typeof updateCommentSchema>;