import { Types } from "mongoose";

export interface SessionType {
  _id?: Types.ObjectId;
  requesterId: Types.ObjectId | string;
  providerId: Types.ObjectId | string;
  skillName: string;
  scheduledAt?: Date;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  meetingDetails?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
