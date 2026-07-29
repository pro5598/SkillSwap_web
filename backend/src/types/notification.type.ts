import mongoose from "mongoose";

export interface NotificationType {
  recipient: mongoose.Types.ObjectId | string;
  sender?: mongoose.Types.ObjectId | string;
  type: "swap_request" | "swap_accepted" | "swap_declined" | "swap_completed" | "skill_approved" | "skill_deleted" | "new_message" | "session_scheduled" | "system";
  content: string;
  isRead: boolean;
  link?: string;
}
