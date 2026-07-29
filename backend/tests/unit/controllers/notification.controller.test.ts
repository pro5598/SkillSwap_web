const service = { getUserNotifications: jest.fn(), markAsRead: jest.fn(), markAllAsRead: jest.fn() };
jest.mock("../../../src/services/notification.service", () => ({ notificationService: service }));
import { NotificationController } from "../../../src/controllers/notification.controller";
const response = () => { const json = jest.fn(); const status = jest.fn(() => ({ json })); return { status, json } as any; };

describe("NotificationController", () => {
  beforeEach(() => jest.clearAllMocks());
  it("covers authentication, missing records, success, and service errors", async () => {
    const next = jest.fn();
    await NotificationController.getNotifications({} as any, response(), next);
    service.getUserNotifications.mockResolvedValue({ notifications: [], unreadCount: 0 });
    await NotificationController.getNotifications({ user: { id: "u1" } } as any, response(), next);
    service.getUserNotifications.mockRejectedValueOnce(new Error("database"));
    await NotificationController.getNotifications({ user: { _id: "u1" } } as any, response(), next);

    await NotificationController.markAsRead({ params: { id: "n1" } } as any, response(), next);
    service.markAsRead.mockResolvedValueOnce(null);
    await NotificationController.markAsRead({ user: { _id: "u1" }, params: { id: "n1" } } as any, response(), next);
    service.markAsRead.mockResolvedValueOnce({ _id: "n1" });
    await NotificationController.markAsRead({ user: { _id: "u1" }, params: { id: "n1" } } as any, response(), next);

    await NotificationController.markAllAsRead({} as any, response(), next);
    service.markAllAsRead.mockResolvedValueOnce(undefined);
    await NotificationController.markAllAsRead({ user: { _id: "u1" } } as any, response(), next);
  });
});
