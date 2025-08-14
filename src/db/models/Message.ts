import { Schema, model, Document, Types, HydratedDocument } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks";

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  readBy: Types.ObjectId[]; // хто прочитав
}

// export type MessageDocument = IMessage & Document<Types.ObjectId>;
export type MessageDocument = HydratedDocument<IMessage> & {
  createdAt: Date;
};

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: "user",
      default: [],
    },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

// --- Indexes ---
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, _id: 1 });

MessageSchema.post("save", handleSaveError);
MessageSchema.pre("findOneAndUpdate", setUpdateSettings);
MessageSchema.post("findOneAndUpdate", handleSaveError);

const Message = model<IMessage>("message", MessageSchema);

export default Message;
