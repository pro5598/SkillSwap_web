import { Router } from "express";
import { SkillController } from "../controllers/skill.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

export const skillRouter = Router();
const skillController = new SkillController();

// Public routes (or authenticated user routes)
skillRouter.get("/", skillController.getAllSkills);
skillRouter.get("/:id", skillController.getSkillById);
skillRouter.get("/category/:categoryId", skillController.getSkillsByCategory);

// Admin only routes
skillRouter.post("/", authorizedMiddleware, adminMiddleware, skillController.createSkill);
skillRouter.put("/:id", authorizedMiddleware, adminMiddleware, skillController.updateSkill);
skillRouter.delete("/:id", authorizedMiddleware, adminMiddleware, skillController.deleteSkill);
