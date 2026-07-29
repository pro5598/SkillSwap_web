import { INotification, NotificationModel } from "../models/notification.model";

class NotificationRepository {
  async createNotification(data: Partial<INotification>): Promise<INotification> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  async getNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await NotificationModel.find({ recipient: userId })
      .populate("sender", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async countUnreadNotifications(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({ recipient: userId, isRead: false });
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }
}

export const notificationRepository = new NotificationRepository();
