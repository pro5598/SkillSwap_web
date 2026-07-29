import { Request, Response } from "express";
import { ReviewModel } from "../models/review.model";
import { SessionModel } from "../models/session.model";
import { SwapRequestModel } from "../models/swap-request.model";
import { ApiResponseHelper } from "../utils/apihelper.util";

export const submitReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = String((req as any).user?._id || (req as any).user?.id);
    const { swapRequestId, rating, comment } = req.body;

    if (!swapRequestId || !rating) {
      return ApiResponseHelper.error(res, "swapRequestId and rating are required", 400);
    }

    const swapRequest = await SwapRequestModel.findById(swapRequestId);
    if (!swapRequest) return ApiResponseHelper.error(res, "Swap Request not found", 404);
    if (swapRequest.status !== "completed") return ApiResponseHelper.error(res, "Swap Request is not completed", 400);

    const senderId = String(swapRequest.senderId);
    const receiverId = String(swapRequest.receiverId);

    if (reviewerId !== senderId && reviewerId !== receiverId) {
      return ApiResponseHelper.error(res, "Not a participant of this swap", 403);
    }

    const revieweeId = reviewerId === senderId ? receiverId : senderId;

    const review = await ReviewModel.create({ reviewerId, revieweeId, swapRequestId, rating, comment });
    return ApiResponseHelper.success(res, { review }, "Review submitted", 201);
  } catch (error: any) {
    if (error.code === 11000) return ApiResponseHelper.error(res, "Already reviewed this swap request", 409);
    return ApiResponseHelper.error(res, "Failed to submit review", 500);
  }
};

export const getReviewsForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const reviews = await ReviewModel.find({ revieweeId: userId })
      .populate("reviewerId", "firstName lastName imageUrl")
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return ApiResponseHelper.success(res, { reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length }, "Reviews fetched");
  } catch {
    return ApiResponseHelper.error(res, "Failed to fetch reviews", 500);
  }
};

export const hasReviewed = async (req: Request, res: Response) => {
  try {
    const reviewerId = String((req as any).user?._id || (req as any).user?.id);
    const { swapRequestId } = req.params;
    const existing = await ReviewModel.findOne({ swapRequestId, reviewerId });
    return ApiResponseHelper.success(res, { reviewed: !!existing }, "Check complete");
  } catch {
    return ApiResponseHelper.error(res, "Failed to check review", 500);
  }
};
