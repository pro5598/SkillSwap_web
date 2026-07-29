import { Request, Response } from "express";
import { SessionModel } from "../models/session.model";
import { SwapRequestModel } from "../models/swap-request.model";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { notificationService } from "../services/notification.service";


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

export const scheduleSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { scheduledAt, meetingDetails } = req.body;
    const userId = String((req as any).user?._id || (req as any).user?.id);

    if (!userId || userId === "undefined") return ApiResponseHelper.error(res, "Unauthorized", 401);
    
    if (!scheduledAt) {
      return ApiResponseHelper.error(res, "scheduledAt is required", 400);
    }

    const session = await SessionModel.findById(sessionId);
    if (!session) return ApiResponseHelper.error(res, "Session not found", 404);

    const providerId = String(session.providerId);
    const requesterId = String(session.requesterId);

    if (providerId !== userId && requesterId !== userId) {
      return ApiResponseHelper.error(res, "Not authorized to update this session", 403);
    }

    session.scheduledAt = scheduledAt;
    if (meetingDetails !== undefined) {
      session.meetingDetails = meetingDetails;
    }
    
    await session.save();

    // Send notification to the other party
    const otherUserId = providerId === userId ? requesterId : providerId;
    await notificationService.createNotification({
      recipient: otherUserId,
      sender: userId,
      type: "session_scheduled",
      content: "A session has been scheduled.",
      link: "/dashboard/sessions"
    });

    return ApiResponseHelper.success(res, { session }, "Session scheduled successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to schedule session", 500);
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
    return ApiResponseHelper.error(res, `Failed to update session: ${error.message}`, 500);
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await SessionModel.find()
      .populate("requesterId", "firstName lastName email imageUrl")
      .populate("providerId", "firstName lastName email imageUrl")
      .sort({ createdAt: -1 });

    return ApiResponseHelper.success(res, { sessions }, "All sessions fetched successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to fetch sessions", 500);
  }
};

export const createFollowUpSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = String((req as any).user?._id || (req as any).user?.id);

    if (!userId || userId === "undefined") return ApiResponseHelper.error(res, "Unauthorized", 401);

    const originalSession = await SessionModel.findById(sessionId);
    if (!originalSession) return ApiResponseHelper.error(res, "Original session not found", 404);

    const providerId = String(originalSession.providerId);
    const requesterId = String(originalSession.requesterId);

    if (providerId !== userId && requesterId !== userId) {
      return ApiResponseHelper.error(res, "Not authorized to create follow-up", 403);
    }

    const { scheduledAt, meetingDetails } = req.body;

    const newSession = new SessionModel({
      requesterId: originalSession.requesterId,
      providerId: originalSession.providerId,
      createdBy: userId,
      skillName: originalSession.skillName,
      status: "pending",
      ...(scheduledAt && { scheduledAt }),
      ...(meetingDetails && { meetingDetails }),
    });

    await newSession.save();

    return ApiResponseHelper.success(res, { session: newSession }, "Follow-up session created", 201);
  } catch (error: any) {
    return ApiResponseHelper.error(res, `Failed to create follow-up session: ${error.message}`, 500);
  }
};
