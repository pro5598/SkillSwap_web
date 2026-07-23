import { Request, Response } from "express";
import { MessageModel } from "../models/message.model";
import { ApiResponseHelper } from "../utils/apihelper.util";

import mongoose from "mongoose";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // The other user's ID
    const myId = (req as any).user?._id || (req as any).user?.id;

    if (!myId || !userId) {
      return ApiResponseHelper.error(res, "Missing user IDs", 400);
    }

    const messages = await MessageModel.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    return ApiResponseHelper.success(res, messages, "Conversation fetched successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to fetch conversation", 500);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { senderId } = req.body;
    const myId = (req as any).user?._id || (req as any).user?.id;

    if (!myId || !senderId) {
      return ApiResponseHelper.error(res, "Missing user IDs", 400);
    }

    await MessageModel.updateMany(
      { senderId, receiverId: myId, read: false },
      { $set: { read: true } }
    );

    return ApiResponseHelper.success(res, null, "Messages marked as read");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to mark messages as read", 500);
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const myId = (req as any).user?._id || (req as any).user?.id;

    if (!myId) {
      return ApiResponseHelper.error(res, "Missing user ID", 400);
    }

    const count = await MessageModel.countDocuments({ receiverId: myId, read: false });

    return ApiResponseHelper.success(res, { count }, "Unread count fetched successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, "Failed to fetch unread count", 500);
  }
};
