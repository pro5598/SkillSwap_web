import mongoose, { Schema, Document } from "mongoose";
import { SkillType } from "../types/skill.type";

export interface ISkill extends Omit<SkillType, 'category'>, Document {
  _id: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId; // Make it an ObjectId referencing Category
  createdAt: Date;
  updatedAt: Date;
}

const SkillMongoSchema: Schema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const SkillModel = mongoose.model<ISkill>("Skill", SkillMongoSchema);
