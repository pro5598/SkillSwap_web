import mongoose, { Schema, Document } from "mongoose";
import { SwapRequestType } from "../types/swap-request.type";

export interface ISwapRequest extends Omit<SwapRequestType, "senderId" | "receiverId">, Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestMongoSchema: Schema = new Schema<ISwapRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skillOffered: { type: String, required: true },
    skillWanted: { type: String, required: true },
    message: { type: String, maxlength: 1000, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const SwapRequestModel = mongoose.model<ISwapRequest>("SwapRequest", SwapRequestMongoSchema);
