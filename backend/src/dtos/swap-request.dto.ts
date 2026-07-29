import { z } from "zod";

export const CreateSwapRequestDto = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  skillOffered: z.string().min(1, "Skill offered is required"),
  skillWanted: z.string().min(1, "Skill wanted is required"),
  message: z.string().max(1000, "Message cannot exceed 1000 characters").optional(),
});

export type CreateSwapRequestDtoType = z.infer<typeof CreateSwapRequestDto>;

export const UpdateSwapRequestStatusDto = z.object({
  status: z.enum(["accepted", "declined", "cancelled", "completed"]),
});

export type UpdateSwapRequestStatusDtoType = z.infer<typeof UpdateSwapRequestStatusDto>;
