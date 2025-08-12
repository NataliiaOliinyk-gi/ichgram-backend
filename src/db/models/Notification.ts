import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks";

export type NotificationType = "follow" | "like" | "comment";

interface INotification {
  recipientId: Types.ObjectId; // кому
  senderId: Types.ObjectId; // від кого
  type: NotificationType;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  isRead: boolean;
}

export type NotificationDocument = INotification & Document<Types.ObjectId>;

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: ["follow", "like", "comment"],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

// індекси

// швидко віддавати стрічку нотифікацій користувача з сортуванням за датою
NotificationSchema.index(
  { recipientId: 1, createdAt: -1 },
  { name: "inbox_recent" }
);
// фільтрувати непрочитані
NotificationSchema.index(
  { recipientId: 1, isRead: 1, createdAt: -1 },
  { name: "unread_by_recipient" }
);

NotificationSchema.post("save", handleSaveError);
NotificationSchema.pre("findOneAndUpdate", setUpdateSettings);
NotificationSchema.post("findOneAndUpdate", handleSaveError);

const Notification = model<INotification>("notification", NotificationSchema);

export default Notification;
