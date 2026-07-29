import { z } from "zod";

export const SkillSchema = z.object({
  name: z
    .string()
    .min(2, "Skill name must be at least 2 characters")
    .max(50, "Skill name is too long")
    .trim(),
  description: z
    .string()
    .max(200, "Description is too long")
    .optional(),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(false),
});

export type SkillType = z.infer<typeof SkillSchema>;
