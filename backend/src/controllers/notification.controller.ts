import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "User not authenticated", 401);
      }

      const result = await notificationService.getUserNotifications(userId.toString());
      return ApiResponseHelper.success(res, result, "Notifications fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || (req.user as any)?.id;
      const { id } = req.params;
      
      if (!userId) {
        return ApiResponseHelper.error(res, "User not authenticated", 401);
      }

      const notification = await notificationService.markAsRead(id as string, userId.toString());
      if (!notification) {
        return ApiResponseHelper.error(res, "Notification not found", 404);
      }

      return ApiResponseHelper.success(res, notification, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "User not authenticated", 401);
      }

      await notificationService.markAllAsRead(userId.toString());
      return ApiResponseHelper.success(res, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}
