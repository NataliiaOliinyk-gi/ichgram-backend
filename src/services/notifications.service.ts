import Notification from "../db/models/Notification";
import User from "../db/models/User";

import HttpExeption from "../utils/HttpExeption";

import { NotificationDocument } from "../db/models/Notification";
import { UserDocument } from "../db/models/User";

export interface INotificationsQuery {
  page: number;
  limit: number;
}
export interface IGetNotificationsResponse {
  notifications: NotificationDocument[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export const getNotifications = async (
  { _id }: UserDocument,
  { page, limit }: INotificationsQuery
): Promise<IGetNotificationsResponse> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    recipientId: _id,
    isRead: false,
  })
    .skip(skip)
    .limit(limit + 1)
    .populate("senderId", "username fullName profilePhoto")
    .populate("postId", "photo text")
    .populate("commentId", "text")
    .sort({ createdAt: -1 });

  const hasMore = notifications.length > limit;
  if (hasMore) notifications.pop();

  return {
    notifications: notifications,
    page,
    limit,
    hasMore,
  };
};

export const markAsRead = async (id: string, { _id: userId }: UserDocument) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: userId },
    { read: true },
    { new: true }
  );

  if (!notification) throw HttpExeption(404, "Notification not found");

  return notification;
};
