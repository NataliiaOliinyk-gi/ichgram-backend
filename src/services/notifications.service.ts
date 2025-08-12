import Notification from "../db/models/Notification";
import User from "../db/models/User";

import HttpExeption from "../utils/HttpExeption";

import { NotificationDocument } from "../db/models/Notification";
import { UserDocument } from "../db/models/User";

export const getNotifications = async ({
  _id,
}: UserDocument): Promise<NotificationDocument[]> => {
  const user: UserDocument | null = await User.findById(_id);
  if (!user) throw HttpExeption(404, `User not found`);

  const notifications = await Notification.find({
    recipientId: _id,
    isRead: false,
  })
    .populate("senderId", "username fullName profilePhoto")
    .populate("postId", "photo text")
    .populate("commentId", "text")
    .sort({ createdAt: -1 });

  return notifications;
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
