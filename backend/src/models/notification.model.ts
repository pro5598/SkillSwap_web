import mongoose, { Schema, Document } from "mongoose";
import { NotificationType } from "../types/notification.type";

export interface INotification extends NotificationType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationMongoSchema: Schema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["swap_request", "swap_accepted", "swap_declined", "swap_completed", "skill_approved", "skill_deleted", "new_message", "session_scheduled", "system"],
      required: true,
    },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationMongoSchema);
