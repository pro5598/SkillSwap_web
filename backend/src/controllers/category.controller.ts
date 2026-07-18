import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();

    this.createCategory = this.createCategory.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  async createCategory(req: Request, res: Response) {
    try {
      const parsedData = CreateCategoryDTO.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }
      const category = await this.categoryService.createCategory(parsedData.data);
      return ApiResponseHelper.success(res, { category }, "Category created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      // By default, public API gets only active. Admin can pass ?all=true
      const includeInactive = req.query.all === "true";
      // If user is not admin and requests all, maybe we still restrict, 
      // but for now we'll allow the query param to dictate, or we can check role.
      // Assuming middleware handles admin authorization for the admin route.
      
      const categories = await this.categoryService.getAllCategories(includeInactive);
      return ApiResponseHelper.success(res, { categories }, "Categories retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const category = await this.categoryService.getCategoryById(id);
      return ApiResponseHelper.success(res, { category }, "Category retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const parsedData = UpdateCategoryDTO.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }
      const category = await this.categoryService.updateCategory(id, parsedData.data);
      return ApiResponseHelper.success(res, { category }, "Category updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await this.categoryService.deleteCategory(id);
      return ApiResponseHelper.success(res, null, "Category deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }
}
