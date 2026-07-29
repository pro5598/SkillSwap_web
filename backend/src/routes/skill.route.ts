import { Router } from "express";
import { SkillController } from "../controllers/skill.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

export const skillRouter = Router();
const skillController = new SkillController();

// Admin route for pending skills count
skillRouter.get("/pending-count", authorizedMiddleware, adminMiddleware, skillController.getPendingCount);

// Public routes (or authenticated user routes)
skillRouter.get("/search", skillController.searchSkills);
skillRouter.get("/", skillController.getAllSkills);
skillRouter.get("/:id", skillController.getSkillById);

// User routes for proposing skills
skillRouter.post("/propose", authorizedMiddleware, skillController.proposeSkill);

// Admin only routes
skillRouter.post("/", authorizedMiddleware, adminMiddleware, skillController.createSkill);
skillRouter.put("/:id", authorizedMiddleware, adminMiddleware, skillController.updateSkill);
skillRouter.delete("/:id", authorizedMiddleware, adminMiddleware, skillController.deleteSkill);
