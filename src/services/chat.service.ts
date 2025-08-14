import { Types } from "mongoose";
import mongoose from "mongoose";
import Conversation, { IConversation } from "../db/models/Conversation";
import Message from "../db/models/Message";

import { ConversationDocument } from "../db/models/Conversation";
import { MessageDocument } from "../db/models/Message";
import { UserDocument } from "../db/models/User";

export interface IConversationResponse {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  key: string;
  lastMessageAt?: Date;
  lastMessageText?: string;
}

export interface IMessagesByConversationResponse {
  conversation: IConversationResponse[];
  page: number;
  limit: number;
  hasMore: boolean;
}


export interface IChatQuery {
  page: number;
  limit: number;
}

const makeKey = (a: Types.ObjectId, b: Types.ObjectId) => {
  const [x, y] = [a.toString(), b.toString()].sort();
  return `${x}_${y}`;
};

export const listConversations = async ({
  _id,
}: UserDocument): Promise<IConversationResponse[]> => {
  const result = await Conversation.find({ participants: _id }).sort({
    lastMessageAt: -1,
  });

  return result;
};

export const getMessagesByConversation = async (
  id: string,
  { page, limit }: IChatQuery
) => {
  const conversationId = new mongoose.Types.ObjectId(id);

  const skip = (page - 1) * limit;
  const items = await Message.find({ conversationId: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1);

  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  return {
    conversation: items.reverse(),
    page,
    limit,
    hasMore,
  };
};

export const startConversation = async (
  userId: string,
  {_id: me}: UserDocument
): Promise<IConversation>  => {
  const other = new mongoose.Types.ObjectId(userId);
  const conversation = await getOrCreateConversation(me, other);
  
  return conversation;
};

export async function getOrCreateConversation(
  me: Types.ObjectId,
  other: Types.ObjectId
) {
  const key = makeKey(me, other);
  let conv = await Conversation.findOne({ key });
  if (!conv) {
    conv = await Conversation.create({ key, participants: [me, other] });
  }
  return conv;
}

export async function addMessage(
  conversationId: Types.ObjectId,
  senderId: Types.ObjectId,
  text: string
) {
  const msg = (await Message.create({
    conversationId,
    senderId,
    text,
    readBy: [senderId], // відправник одразу "прочитав"
  })) as MessageDocument;

  await Conversation.updateOne(
    { _id: conversationId },
    { $set: { lastMessageAt: msg.createdAt, lastMessageText: text } }
  );

  return msg;
}

export async function markRead(
  conversationId: Types.ObjectId,
  userId: Types.ObjectId
) {
  await Message.updateMany(
    { conversationId, readBy: { $ne: userId } },
    { $push: { readBy: userId } }
  );
}

export async function getMessages(
  conversationId: Types.ObjectId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  const items = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1)
    .lean();

  const hasMore = items.length > limit;
  if (hasMore) items.pop();
  // віддамо у зростаючому порядку часу:
  return { messages: items.reverse(), page, limit, hasMore };
}
