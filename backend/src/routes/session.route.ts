import { Router } from "express";
import { createSession, getMySessions, updateSessionStatus } from "../controllers/session.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

export const sessionRouter = Router();

sessionRouter.use(authorizedMiddleware);

sessionRouter.post("/", createSession);
sessionRouter.get("/", getMySessions);
sessionRouter.patch("/:sessionId/status", updateSessionStatus);
