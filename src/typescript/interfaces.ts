import { Request } from "express";
import { UserDocument } from "../db/models/User";

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

// export interface IHttpError extends Error {
//   status: number;
// }
