import { SkillMongoRepository } from "../repositories/skill.repository";
import { CategoryMongoRepository } from "../repositories/category.repository";
import { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto";
import { HttpException } from "../exceptions/http-exception";

const skillRepository = new SkillMongoRepository();
const categoryRepository = new CategoryMongoRepository();

export class SkillService {
  async createSkill(data: CreateSkillDTO) {
    const existing = await skillRepository.getSkillByName(data.name);
    if (existing) {
      throw new HttpException(400, "Skill with this name already exists");
    }

    const category = await categoryRepository.getCategoryById(data.category);
    if (!category) {
      throw new HttpException(400, "Category not found");
    }

    return await skillRepository.createSkill(data);
  }

  async getAllSkills(includeInactive: boolean = false) {
    if (includeInactive) {
      return await skillRepository.getAllSkills();
    }
    return await skillRepository.getActiveSkills();
  }

  async getSkillById(id: string) {
    const skill = await skillRepository.getSkillById(id);
    if (!skill) {
      throw new HttpException(404, "Skill not found");
    }
    return skill;
  }

  async getSkillsByCategory(categoryId: string) {
    return await skillRepository.getSkillsByCategoryId(categoryId);
  }

  async updateSkill(id: string, data: UpdateSkillDTO) {
    if (data.name) {
      const existing = await skillRepository.getSkillByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw new HttpException(400, "Skill with this name already exists");
      }
    }

    if (data.category) {
      const category = await categoryRepository.getCategoryById(data.category);
      if (!category) {
        throw new HttpException(400, "Category not found");
      }
    }

    const updated = await skillRepository.updateSkill(id, data);
    if (!updated) {
      throw new HttpException(404, "Skill not found");
    }
    return updated;
  }

  async deleteSkill(id: string) {
    const deleted = await skillRepository.deleteSkill(id);
    if (!deleted) {
      throw new HttpException(404, "Skill not found");
    }
    return deleted;
  }
}
