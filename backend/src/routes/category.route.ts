import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

export const categoryRouter = Router();
const categoryController = new CategoryController();

// Public routes (or authenticated user routes)
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);

// Admin only routes
categoryRouter.post("/", authorizedMiddleware, adminMiddleware, categoryController.createCategory);
categoryRouter.put("/:id", authorizedMiddleware, adminMiddleware, categoryController.updateCategory);
categoryRouter.delete("/:id", authorizedMiddleware, adminMiddleware, categoryController.deleteCategory);
