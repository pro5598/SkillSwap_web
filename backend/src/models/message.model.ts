import mongoose, { Schema, Document } from "mongoose";
import { MessageType } from "../types/message.type";

export interface IMessage extends Omit<MessageType, "senderId" | "receiverId">, Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageMongoSchema: Schema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: false, trim: true, maxlength: 2000 },
    fileUrl: { type: String, required: false },
    fileType: { type: String, required: false },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageMongoSchema);
