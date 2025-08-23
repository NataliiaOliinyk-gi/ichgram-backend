import { ValidationType } from "../typescript/type";

export const emailValidation: ValidationType = {
  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  message: "email mast contain @, dot and no contain spaces",
};

export const passwordValidation: ValidationType = {
  value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])\S{6,64}$/,
  message:
    "Password must be 6-64 characters and include 1 letter, 1 number and 1 special symbol",
};
