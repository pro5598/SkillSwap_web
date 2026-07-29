import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

export const notificationRouter = Router();

notificationRouter.get(
  "/",
  authorizedMiddleware,
  NotificationController.getNotifications
);

notificationRouter.put(
  "/read-all",
  authorizedMiddleware,
  NotificationController.markAllAsRead
);

notificationRouter.put(
  "/:id/read",
  authorizedMiddleware,
  NotificationController.markAsRead
);
