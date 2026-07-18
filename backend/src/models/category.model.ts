import mongoose, { Schema, Document } from "mongoose";
import { CategoryType } from "../types/category.type";

export interface ICategory extends CategoryType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryMongoSchema: Schema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = mongoose.model<ICategory>("Category", CategoryMongoSchema);
