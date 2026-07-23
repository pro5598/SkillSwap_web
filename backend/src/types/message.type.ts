import { Types } from "mongoose";

export interface MessageType {
  _id?: Types.ObjectId;
  senderId: Types.ObjectId | string;
  receiverId: Types.ObjectId | string;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
