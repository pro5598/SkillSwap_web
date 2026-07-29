import { Request, Response } from "express";
import { SkillService } from "../services/skill.service";
import { CreateSkillDTO, UpdateSkillDTO } from "../dtos/skill.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class SkillController {
  private skillService: SkillService;

  constructor() {
    this.skillService = new SkillService();

    this.createSkill = this.createSkill.bind(this);
    this.proposeSkill = this.proposeSkill.bind(this);
    this.getAllSkills = this.getAllSkills.bind(this);
    this.getSkillById = this.getSkillById.bind(this);
    this.updateSkill = this.updateSkill.bind(this);
    this.deleteSkill = this.deleteSkill.bind(this);
    this.getPendingCount = this.getPendingCount.bind(this);
    this.searchSkills = this.searchSkills.bind(this);
  }

  async createSkill(req: Request, res: Response) {
    try {
      const parsedData = CreateSkillDTO.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }
      const skill = await this.skillService.createSkill(parsedData.data);
      return ApiResponseHelper.success(res, { skill }, "Skill created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async proposeSkill(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userId = req.user?._id?.toString() || (req.user as { id?: string })?.id;
      
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return ApiResponseHelper.error(res, "Invalid skill name. Must be at least 2 characters.", 400);
      }
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      
      const skill = await this.skillService.proposeSkill(name.trim(), userId.toString());
      return ApiResponseHelper.success(res, { skill }, "Skill proposed successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async getAllSkills(req: Request, res: Response) {
    try {
      const includeInactive = req.query.all === "true";
      const skills = await this.skillService.getAllSkills(includeInactive);
      return ApiResponseHelper.success(res, { skills }, "Skills retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async getSkillById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const skill = await this.skillService.getSkillById(id);
      return ApiResponseHelper.success(res, { skill }, "Skill retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async updateSkill(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const parsedData = UpdateSkillDTO.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }
      const skill = await this.skillService.updateSkill(id, parsedData.data);
      return ApiResponseHelper.success(res, { skill }, "Skill updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async deleteSkill(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await this.skillService.deleteSkill(id);
      return ApiResponseHelper.success(res, null, "Skill deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async searchSkills(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || "";
      const skills = await this.skillService.searchSkills(query);
      return ApiResponseHelper.success(res, { skills }, "Skills search completed");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }

  async getPendingCount(req: Request, res: Response) {
    try {
      const count = await this.skillService.getPendingCount();
      return ApiResponseHelper.success(res, { count }, "Pending skills count retrieved");
    } catch (error: any) {
      console.error("GET PENDING COUNT ERROR:", error);
      return ApiResponseHelper.error(res, error.message, error.status || 500);
    }
  }
}
