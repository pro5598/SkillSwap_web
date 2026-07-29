import { SkillModel, ISkill } from "../models/skill.model";
import { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto";

export class SkillMongoRepository {
  async createSkill(data: CreateSkillDTO): Promise<ISkill> {
    return await SkillModel.create(data);
  }

  async proposeSkill(name: string, userId: string): Promise<ISkill> {
    return await SkillModel.create({ 
      name, 
      isActive: true, 
      isApproved: true,
      proposedBy: [userId]
    });
  }

  async getAllSkills(): Promise<ISkill[]> {
    return await SkillModel.find().sort({ name: 1 });
  }

  async getActiveSkills(): Promise<ISkill[]> {
    return await SkillModel.find({ isActive: true }).sort({ name: 1 });
  }

  async searchSkills(query: string): Promise<ISkill[]> {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return await SkillModel.find({
      isActive: true,
      name: { $regex: escaped, $options: "i" },
    })
      .sort({ name: 1 })
      .limit(20);
  }

  async getSkillById(id: string): Promise<ISkill | null> {
    return await SkillModel.findById(id);
  }

  async getSkillByName(name: string): Promise<ISkill | null> {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return await SkillModel.findOne({ name: { $regex: new RegExp(`^${escaped}$`, "i") } });
  }

  async updateSkill(id: string, data: UpdateSkillDTO): Promise<ISkill | null> {
    return await SkillModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSkill(id: string): Promise<ISkill | null> {
    return await SkillModel.findByIdAndDelete(id);
  }

  async getPendingCount(): Promise<number> {
    return await SkillModel.countDocuments({ isApproved: false });
  }
}
