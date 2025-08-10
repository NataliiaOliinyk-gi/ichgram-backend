import * as Yup from "yup";

export const addLikeSchema = Yup.object({
  postId: Yup.string().required(),
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type AddLikeSchema = Yup.InferType<typeof addLikeSchema>;
