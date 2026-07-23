import { Request, Response } from "express";
import { SessionModel } from "../models/session.model";
import { ApiResponseHelper } from "../utils/apihelper.util";


export const createSession = async (req: Request, res: Response) => {
  try {
    const { providerId, scheduledAt, meetingDetails, notes } = req.body;
    const requesterId = (req as any).user?._id || (req as any).user?.id;

    if (!requesterId || !providerId || !scheduledAt) {
      return ApiResponseHelper.error(res, "Missing required fields", 400);
    }

    const session = new SessionModel({
      requesterId,
      providerId,
      scheduledAt,
      meetingDetails,
      notes,
    });

    await session.save();

    return ApiResponseHelper.success(res, { session }, "Session created successfully", 201);
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to create session", 500);
  }
};

export const getMySessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;

    if (!userId) {
      return ApiResponseHelper.error(res, "Unauthorized", 401);
    }

    const sessions = await SessionModel.find({
      $or: [{ requesterId: userId }, { providerId: userId }],
    }).populate("requesterId providerId", "firstName lastName imageUrl");

    return ApiResponseHelper.success(res, { sessions }, "Sessions fetched successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to fetch sessions", 500);
  }
};

export const updateSessionStatus = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    const userId = String((req as any).user?._id || (req as any).user?.id);

    if (!userId || userId === "undefined") return ApiResponseHelper.error(res, "Unauthorized", 401);

    const session = await SessionModel.findById(sessionId);
    if (!session) return ApiResponseHelper.error(res, "Session not found", 404);

    const providerId = String(session.providerId);
    const requesterId = String(session.requesterId);

    if (providerId !== userId && requesterId !== userId) {
      return ApiResponseHelper.error(res, "Not authorized to update this session", 403);
    }

    session.status = status;
    await session.save();

    return ApiResponseHelper.success(res, { session }, "Session updated successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to update session", 500);
  }
};
