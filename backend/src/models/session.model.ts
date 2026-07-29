import mongoose, { Schema, Document } from "mongoose";
import { SessionType } from "../types/session.type";

export interface ISession extends Omit<SessionType, "requesterId" | "providerId">, Document {
  _id: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SessionMongoSchema: Schema = new Schema<ISession>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    skillName: { type: String, required: false },
    scheduledAt: { type: Date, required: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled"],
      default: "pending",
    },
    meetingDetails: { type: String, maxlength: 1000, trim: true },
    notes: { type: String, maxlength: 2000, trim: true },
  },
  {
    timestamps: true,
  }
);

export const SessionModel = mongoose.model<ISession>("Session", SessionMongoSchema);
