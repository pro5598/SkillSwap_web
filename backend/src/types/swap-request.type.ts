import { z } from "zod";

export const SwapRequestSchema = z.object({
  senderId: z.string().min(1, "Sender ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  skillOffered: z.string().min(1, "Skill offered is required"),
  skillWanted: z.string().min(1, "Skill wanted is required"),
  message: z.string().max(1000, "Message cannot exceed 1000 characters").optional(),
  status: z.enum(["pending", "accepted", "declined", "cancelled", "completed"]).default("pending"),
});

export type SwapRequestType = z.infer<typeof SwapRequestSchema>;
