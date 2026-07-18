import { SkillModel, ISkill } from "../models/skill.model";
import { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto";

export class SkillMongoRepository {
  async createSkill(data: CreateSkillDTO): Promise<ISkill> {
    return await SkillModel.create(data);
  }

  async getAllSkills(): Promise<ISkill[]> {
    return await SkillModel.find().populate("category").sort({ name: 1 });
  }

  async getActiveSkills(): Promise<ISkill[]> {
    return await SkillModel.find({ isActive: true }).populate("category").sort({ name: 1 });
  }

  async getSkillById(id: string): Promise<ISkill | null> {
    return await SkillModel.findById(id).populate("category");
  }

  async getSkillByName(name: string): Promise<ISkill | null> {
    return await SkillModel.findOne({ name });
  }

  async getSkillsByCategoryId(categoryId: string): Promise<ISkill[]> {
    return await SkillModel.find({ category: categoryId }).sort({ name: 1 });
  }

  async updateSkill(id: string, data: UpdateSkillDTO): Promise<ISkill | null> {
    return await SkillModel.findByIdAndUpdate(id, data, { new: true }).populate("category");
  }

  async deleteSkill(id: string): Promise<ISkill | null> {
    return await SkillModel.findByIdAndDelete(id);
  }
}
