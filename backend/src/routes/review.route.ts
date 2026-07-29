import { Router } from "express";
import { submitReview, getReviewsForUser, hasReviewed } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

export const reviewRouter = Router();

reviewRouter.post("/", authorizedMiddleware, submitReview);
reviewRouter.get("/user/:userId", getReviewsForUser);
reviewRouter.get("/swap-request/:swapRequestId/me", authorizedMiddleware, hasReviewed);
