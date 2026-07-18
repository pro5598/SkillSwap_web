import { CategoryMongoRepository } from "../repositories/category.repository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";
import { HttpException } from "../exceptions/http-exception";

const categoryRepository = new CategoryMongoRepository();

export class CategoryService {
  async createCategory(data: CreateCategoryDTO) {
    const existing = await categoryRepository.getCategoryByName(data.name);
    if (existing) {
      throw new HttpException(400, "Category with this name already exists");
    }
    return await categoryRepository.createCategory(data);
  }

  async getAllCategories(includeInactive: boolean = false) {
    if (includeInactive) {
      return await categoryRepository.getAllCategories();
    }
    return await categoryRepository.getActiveCategories();
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      throw new HttpException(404, "Category not found");
    }
    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryDTO) {
    if (data.name) {
      const existing = await categoryRepository.getCategoryByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw new HttpException(400, "Category with this name already exists");
      }
    }
    const updated = await categoryRepository.updateCategory(id, data);
    if (!updated) {
      throw new HttpException(404, "Category not found");
    }
    return updated;
  }

  async deleteCategory(id: string) {
    const deleted = await categoryRepository.deleteCategory(id);
    if (!deleted) {
      throw new HttpException(404, "Category not found");
    }
    return deleted;
  }
}
