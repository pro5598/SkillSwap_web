import { SkillMongoRepository } from "../repositories/skill.repository";
import { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto";
import { HttpException } from "../exceptions/http-exception";
import { notificationService } from "./notification.service";
import { UserModel } from "../models/user.model";

const skillRepository = new SkillMongoRepository();

export class SkillService {
  async createSkill(data: CreateSkillDTO) {
    const existing = await skillRepository.getSkillByName(data.name);
    if (existing) {
      throw new HttpException(400, "Skill with this name already exists");
    }

    return await skillRepository.createSkill(data);
  }

  async proposeSkill(name: string, userId: string) {
    const trimmedName = name.trim();
    const existing = await skillRepository.getSkillByName(trimmedName);
    if (existing) {
      const alreadyProposed = existing.proposedBy?.some(
        (id) => id.toString() === userId
      );
      if (!alreadyProposed) {
        existing.proposedBy = existing.proposedBy || [];
        existing.proposedBy.push(userId as any);
        await existing.save();
      }
      return existing;
    }
    return await skillRepository.proposeSkill(trimmedName, userId);
  }

  async searchSkills(query: string) {
    if (!query || query.trim().length < 1) {
      return [];
    }
    return await skillRepository.searchSkills(query.trim());
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

  async updateSkill(id: string, data: UpdateSkillDTO) {
    if (data.name) {
      const existing = await skillRepository.getSkillByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw new HttpException(400, "Skill with this name already exists");
      }
    }

    const existingSkill = await skillRepository.getSkillById(id);
    if (!existingSkill) {
      throw new HttpException(404, "Skill not found");
    }

    const wasPending = !existingSkill.isApproved;

    const updated = await skillRepository.updateSkill(id, data);
    if (!updated) {
      throw new HttpException(404, "Skill not found");
    }

    // If it was pending and is now approved, notify the proposers
    if (wasPending && updated.isApproved && updated.proposedBy && updated.proposedBy.length > 0) {
      for (const userId of updated.proposedBy) {
        await notificationService.createNotification({
          recipient: userId.toString(),
          sender: "system", // Admin action
          type: "skill_approved",
          content: `Your proposed skill "${updated.name}" has been approved! It is now visible to everyone.`,
          link: "/dashboard/profile"
        });
      }
      
    }

    return updated;
  }

  async deleteSkill(id: string) {
    const skill = await skillRepository.getSkillById(id);
    if (!skill) {
      throw new HttpException(404, "Skill not found");
    }

    const skillName = skill.name;
    const affectedUserIds = new Set<string>();

    if (skill.proposedBy?.length) {
      for (const userId of skill.proposedBy) {
        affectedUserIds.add(userId.toString());
      }
    }

    const usersWithSkill = await UserModel.find({
      $or: [{ skillsOffered: skillName }, { skillsWanted: skillName }],
    });

    for (const user of usersWithSkill) {
      affectedUserIds.add(user._id.toString());
      user.skillsOffered = (user.skillsOffered || []).filter((s) => s !== skillName);
      user.skillsWanted = (user.skillsWanted || []).filter((s) => s !== skillName);
      await user.save();
    }

    const deleted = await skillRepository.deleteSkill(id);
    if (!deleted) {
      throw new HttpException(404, "Skill not found");
    }

    for (const userId of affectedUserIds) {
      await notificationService.createNotification({
        recipient: userId,
        type: "skill_deleted",
        content: `The skill "${skillName}" has been removed by an admin. Please update your profile and add an appropriate skill.`,
        link: "/dashboard/profile",
      });
    }

    return deleted;
  }

  async getPendingCount() {
    return await skillRepository.getPendingCount();
  }
}
