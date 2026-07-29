import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = z.object({
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  email: z.string().min(1, "Email is required").email("Invalid email format").trim().lowercase(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).trim().lowercase(),
  phoneNumber: z.string().min(10).regex(/^\d+$/).trim(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format").trim().lowercase(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const GoogleAuthDTO = z.object({
  credential: z.string().min(1, "Google credential is required"),
});
export type GoogleAuthDTO = z.infer<typeof GoogleAuthDTO>;

export const ForgotPasswordDTO = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format").trim().lowercase(),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

export const UpdateUserDTO = UserSchema.partial().extend({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters long").optional(),
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
