import { z } from "zod";
import { SkillSchema } from "../types/skill.type";

export const CreateSkillDTO = SkillSchema;
export type CreateSkillDTO = z.infer<typeof CreateSkillDTO>;

export const UpdateSkillDTO = SkillSchema.partial();
export type UpdateSkillDTO = z.infer<typeof UpdateSkillDTO>;
