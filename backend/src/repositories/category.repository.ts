import { CategoryModel, ICategory } from "../models/category.model";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";

export class CategoryMongoRepository {
  async createCategory(data: CreateCategoryDTO): Promise<ICategory> {
    return await CategoryModel.create(data);
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await CategoryModel.find().sort({ name: 1 });
  }
  
  async getActiveCategories(): Promise<ICategory[]> {
    return await CategoryModel.find({ isActive: true }).sort({ name: 1 });
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await CategoryModel.findById(id);
  }
  
  async getCategoryByName(name: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ name });
  }

  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndDelete(id);
  }
}
