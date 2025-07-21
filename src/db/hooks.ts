import { CallbackError, Document, Query } from "mongoose";

type MyHookNextFunction = (err?: CallbackError) => void;

export const handleSaveError = (
  error: CallbackError & {
    code?: number;
    keyValue?: Record<string, string>;
    status?: number;
  },
  doc: Document,
  next: MyHookNextFunction
): void => {
  if (error.name === "MongoServerError" && error.code === 11000) {
    error.status = 409; // Conflict

    const field = Object.keys(error.keyValue || {})[0];
    const value = error.keyValue?.[field];

    error.message = `The ${field} '${value}' is already in use.`;
  } else {
    error.status = 400; // Bad Request
    error.message = error.message || "Validation error";
  }
  next();
};

export const setUpdateSettings = function (
  this: Query<any, any>,
  next: MyHookNextFunction
): void {
  this.setOptions({ new: true, runValidators: true });
  next();
};

