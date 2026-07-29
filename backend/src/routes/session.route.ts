import { Router } from "express";
import { createSession, getMySessions, updateSessionStatus, getAllSessions, scheduleSession, createFollowUpSession } from "../controllers/session.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

export const sessionRouter = Router();

sessionRouter.use(authorizedMiddleware);

sessionRouter.post("/", createSession);
sessionRouter.get("/", getMySessions);
sessionRouter.patch("/:sessionId/status", updateSessionStatus);
sessionRouter.patch("/:sessionId/schedule", scheduleSession);
sessionRouter.post("/:sessionId/follow-up", createFollowUpSession);

// Admin routes
sessionRouter.get("/admin/all", adminMiddleware, getAllSessions);
