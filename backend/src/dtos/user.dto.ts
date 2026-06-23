import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  phoneNumber: true,
  password: true,
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial().extend({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters long").optional(),
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
