import mongoose, { Schema, Document } from "mongoose";
import { SkillType } from "../types/skill.type";

export interface ISkill extends SkillType, Document {
  _id: mongoose.Types.ObjectId;
  isApproved: boolean;
  proposedBy?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillMongoSchema: Schema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    proposedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export const SkillModel = mongoose.model<ISkill>("Skill", SkillMongoSchema);
