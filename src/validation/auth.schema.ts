import * as Yup from "yup";

import { emailSchema, passwordSchema } from "./fields.schema";

export const registerSchema = Yup.object({
  email: emailSchema,
  fullName: Yup.string().trim().required(),
  username: Yup.string().trim().required(),
  password: passwordSchema,
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type RegisterSchema = Yup.InferType<typeof registerSchema>;

export const loginSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type LoginSchema = Yup.InferType<typeof loginSchema>;

export const changePasswordSchema = Yup.object({
  password: passwordSchema,
  newPassword: passwordSchema,
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type ChangePasswordSchema = Yup.InferType<typeof changePasswordSchema>;

export const changeEmailSchema = Yup.object({
  newEmail: emailSchema,
  password: passwordSchema,
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type ChangeEmailSchema = Yup.InferType<typeof changeEmailSchema>;

export const deleteAccountSchema = Yup.object({
  password: passwordSchema,
}).noUnknown(true, ({ unknown }) => `Unknown field: ${unknown}`);

export type DeleteAccountSchema = Yup.InferType<typeof deleteAccountSchema>;
