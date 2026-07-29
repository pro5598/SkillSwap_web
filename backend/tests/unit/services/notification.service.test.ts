const repository = { createNotification: jest.fn(), getNotificationsByUserId: jest.fn(), countUnreadNotifications: jest.fn(), markAsRead: jest.fn(), markAllAsRead: jest.fn() };
const to = jest.fn(() => ({ emit: jest.fn() })); const getIO = jest.fn();
jest.mock("../../../src/repositories/notification.repository", () => ({ notificationRepository: repository }));
jest.mock("../../../src/socket", () => ({ getIO }));
import { notificationService } from "../../../src/services/notification.service";

describe("NotificationService", () => {
  beforeEach(() => { jest.clearAllMocks(); });
  it("stores notifications and emits unread counts when sockets are available", async () => {
    repository.createNotification.mockResolvedValue({ id: "n1" }); repository.countUnreadNotifications.mockResolvedValue(3); getIO.mockReturnValue({ to });
    await expect(notificationService.createNotification({ recipient: "u1" } as any)).resolves.toEqual({ id: "n1" }); expect(to).toHaveBeenCalledWith("u1");
    repository.getNotificationsByUserId.mockResolvedValue([{ id: "n1" }]); await expect(notificationService.getUserNotifications("u1")).resolves.toEqual({ notifications: [{ id: "n1" }], unreadCount: 3 });
  });
  it("marks individual and all notifications as read", async () => {
    repository.markAsRead.mockResolvedValue({ id: "n1" }); repository.countUnreadNotifications.mockResolvedValue(0); getIO.mockReturnValue({ to });
    await expect(notificationService.markAsRead("n1", "u1")).resolves.toEqual({ id: "n1" }); repository.markAllAsRead.mockResolvedValue(undefined); await expect(notificationService.markAllAsRead("u1")).resolves.toBe(true);
    getIO.mockReturnValue(null); await notificationService.createNotification({ recipient: "u1" } as any);
  });
});
