import { z } from "zod";

export const SkillSchema = z.object({
  name: z
    .string()
    .min(2, "Skill name must be at least 2 characters")
    .max(50, "Skill name is too long")
    .trim(),
  category: z.string().min(1, "Category ID is required"), // ObjectId as string
  description: z
    .string()
    .max(200, "Description is too long")
    .optional(),
  isActive: z.boolean().default(true),
});

export type SkillType = z.infer<typeof SkillSchema>;
