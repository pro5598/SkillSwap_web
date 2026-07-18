import { z } from "zod";

export const CategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name is too long")
    .trim(),
  description: z
    .string()
    .max(200, "Description is too long")
    .optional(),
  isActive: z.boolean().default(true),
});

export type CategoryType = z.infer<typeof CategorySchema>;
