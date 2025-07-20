import * as Yup from "yup";

import {
  emailValidation,
  passwordValidation,
} from "../constants/user.constants";

export const passwordSchema = Yup.string()
  .trim()
  .matches(passwordValidation.value, passwordValidation.message)
  .required();

export type PasswordSchema = Yup.InferType<typeof passwordSchema>;

export const emailSchema = Yup.string()
  .trim()
  .matches(emailValidation.value, emailValidation.message)
  .required();

export type EmailSchema = Yup.InferType<typeof emailSchema>;
