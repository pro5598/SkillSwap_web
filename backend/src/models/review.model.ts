import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  revieweeId: mongoose.Types.ObjectId;
  swapRequestId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    swapRequestId: { type: Schema.Types.ObjectId, ref: "SwapRequest", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, trim: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ swapRequestId: 1, reviewerId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
