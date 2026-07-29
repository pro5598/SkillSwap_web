import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserMongoSchema: Schema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    imageUrl: { type: String, required: false },
    bio: { type: String, trim: true, maxlength: 500 },
    skillsOffered: { type: [String], default: [] },
    skillsWanted: { type: [String], default: [] },
    experienceLevel: { type: String, enum: ["Beginner", "Intermediate", "Expert"] },
    location: { type: String, trim: true },
    availabilitySchedule: { type: String, trim: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    subscriptionStatus: { type: String, enum: ["free", "pro"], default: "free" },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);
