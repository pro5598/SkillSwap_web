import { notificationRepository } from "../repositories/notification.repository";
import { INotification } from "../models/notification.model";
import { getIO } from "../socket";

class NotificationService {
  async createNotification(data: Partial<INotification>): Promise<INotification> {
    const notification = await notificationRepository.createNotification(data);
    
    const io = getIO();
    if (io && data.recipient) {
      const recipientStr = data.recipient.toString();
      io.to(recipientStr).emit("new_notification", notification);
      
      const count = await notificationRepository.countUnreadNotifications(recipientStr);
      io.to(recipientStr).emit("notifications_count", { count });
    }
    
    return notification;
  }

  async getUserNotifications(userId: string) {
    const notifications = await notificationRepository.getNotificationsByUserId(userId);
    const unreadCount = await notificationRepository.countUnreadNotifications(userId);
    
    return {
      notifications,
      unreadCount
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    
    const io = getIO();
    if (notification && io) {
      const count = await notificationRepository.countUnreadNotifications(userId);
      io.to(userId).emit("notifications_count", { count });
    }
    
    return notification;
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    const io = getIO();
    if (io) {
      io.to(userId).emit("notifications_count", { count: 0 });
    }
    return true;
  }
}

export const notificationService = new NotificationService();
