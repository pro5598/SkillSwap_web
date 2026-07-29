import { SwapRequestRepository } from "../repositories/swap-request.repository";
import { CreateSwapRequestDtoType, UpdateSwapRequestStatusDtoType } from "../dtos/swap-request.dto";
import { HttpException } from "../exceptions/http-exception";
import { SessionModel } from "../models/session.model";
import mongoose from "mongoose";
import { notificationService } from "./notification.service";

const swapRequestRepository = new SwapRequestRepository();

export class SwapRequestService {
  async sendRequest(senderId: string, data: CreateSwapRequestDtoType) {
    if (senderId === data.receiverId) {
      throw new HttpException(400, "You cannot send a swap request to yourself");
    }

    const existingRequest = await swapRequestRepository.findExistingRequest(senderId, data.receiverId);
    if (existingRequest) {
      throw new HttpException(400, "You already have a pending swap request with this user");
    }

    const requestData = {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(data.receiverId),
      skillOffered: data.skillOffered,
      skillWanted: data.skillWanted,
      message: data.message,
      status: "pending" as const,
    };

    const newRequest = await swapRequestRepository.createRequest(requestData);

    // Notify receiver
    await notificationService.createNotification({
      recipient: requestData.receiverId,
      sender: requestData.senderId,
      type: "swap_request",
      content: "You have a new swap request!",
      link: "/dashboard/requests"
    });

    return newRequest;
  }

  async getReceivedRequests(userId: string) {
    return await swapRequestRepository.findReceivedRequests(userId);
  }

  async getSentRequests(userId: string) {
    return await swapRequestRepository.findSentRequests(userId);
  }

  async respondToRequest(userId: string, requestId: string, data: UpdateSwapRequestStatusDtoType) {
    const request = await swapRequestRepository.findById(requestId);

    if (!request) {
      throw new HttpException(404, "Swap request not found");
    }

    // Only the receiver can accept/decline
    if (
      data.status === "accepted" || data.status === "declined"
    ) {
      if (request.receiverId._id.toString() !== userId) {
        throw new HttpException(403, "You are not authorized to respond to this request");
      }
    }

    // Only sender can cancel
    if (data.status === "cancelled") {
      if (request.senderId._id.toString() !== userId) {
        throw new HttpException(403, "You are not authorized to cancel this request");
      }
    }

    // Either party can complete
    if (data.status === "completed") {
      const isSender = request.senderId._id.toString() === userId;
      const isReceiver = request.receiverId._id.toString() === userId;
      if (!isSender && !isReceiver) {
        throw new HttpException(403, "You are not authorized to complete this swap");
      }
    }

    // Validate status transitions
    if (data.status === "completed" && request.status !== "accepted") {
      throw new HttpException(400, "Only accepted swaps can be marked as completed");
    } else if (data.status !== "completed" && request.status !== "pending") {
      throw new HttpException(400, `Request has already been ${request.status}`);
    }

    const updatedRequest = await swapRequestRepository.updateStatus(requestId, data.status);

    if (data.status === "accepted") {
      await SessionModel.create([
        {
          requesterId: request.receiverId._id,
          providerId: request.senderId._id,
          skillName: request.skillOffered,
          status: "pending",
        },
        {
          requesterId: request.senderId._id,
          providerId: request.receiverId._id,
          skillName: request.skillWanted,
          status: "pending",
        }
      ]);

      await notificationService.createNotification({
        recipient: request.senderId._id,
        sender: request.receiverId._id,
        type: "swap_accepted",
        content: "Your swap request was accepted!",
        link: "/dashboard/sessions"
      });
    } else if (data.status === "declined") {
      await notificationService.createNotification({
        recipient: request.senderId._id,
        sender: request.receiverId._id,
        type: "swap_declined",
        content: "Your swap request was declined.",
        link: "/dashboard/requests"
      });
    } else if (data.status === "completed") {
      // Notify the other party
      const otherUserId = request.senderId._id.toString() === userId
        ? request.receiverId._id
        : request.senderId._id;
      await notificationService.createNotification({
        recipient: otherUserId,
        sender: userId,
        type: "swap_completed",
        content: "A swap has been marked as completed! You can now leave a review.",
        link: "/dashboard/swaps"
      });
    }

    return updatedRequest;
  }

  async getAllRequests() {
    return await swapRequestRepository.findAll();
  }
}
