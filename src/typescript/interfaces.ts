import { Request } from "express";
import { UserDocument } from "../db/models/User";

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}




// interface IUserPreview {
//   _id: string;
//   username: string;
//   fullName: string;
//   profilePhoto?: string;
// }

// export interface IPostLeanForFeed {
//   _id: Types.ObjectId;
//   userId: IUserPreview;
//   text: string;
//   photo: string;
//   likesCount: number;
//   commentsCount: number;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export interface IPostResponse extends IPostLeanForFeed {
//   isLikedByCurrentUser: boolean;
// }
