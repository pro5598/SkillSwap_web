import { z } from "zod";

export const UserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .trim()
    .lowercase(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .trim()
    .lowercase(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only numbers")
    .trim(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["admin", "user"]).default("user"),
  imageUrl: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  skillsOffered: z.array(z.string()).optional(),
  skillsWanted: z.array(z.string()).optional(),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Expert"]).optional(),
  location: z.string().optional(),
  availabilitySchedule: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;