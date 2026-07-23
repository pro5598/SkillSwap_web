import { Router } from "express";
import { getConversation, markAsRead, getUnreadCount } from "../controllers/message.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

export const messageRouter = Router();

messageRouter.use(authorizedMiddleware);

import { messageUploads } from "../middlewares/upload.middleware";
import { ApiResponseHelper } from "../utils/apihelper.util";

messageRouter.post("/upload", messageUploads.single("file"), (req, res) => {
  if (!req.file) {
    return ApiResponseHelper.error(res, "No file uploaded", 400);
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype;
  return ApiResponseHelper.success(res, { fileUrl, fileType }, "File uploaded successfully", 200);
});

messageRouter.get("/unread-count", getUnreadCount);
messageRouter.get("/conversation/:userId", getConversation);
messageRouter.patch("/read", markAsRead);
