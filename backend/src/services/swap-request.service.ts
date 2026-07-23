import { SwapRequestRepository } from "../repositories/swap-request.repository";
import { CreateSwapRequestDtoType, UpdateSwapRequestStatusDtoType } from "../dtos/swap-request.dto";
import { HttpException } from "../exceptions/http-exception";
import mongoose from "mongoose";

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

    return await swapRequestRepository.createRequest(requestData);
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
      request.receiverId._id.toString() !== userId &&
      data.status !== "cancelled"
    ) {
      throw new HttpException(403, "You are not authorized to respond to this request");
    }
    
    // Only sender can cancel
    if (
      request.senderId._id.toString() !== userId &&
      data.status === "cancelled"
    ) {
      throw new HttpException(403, "You are not authorized to cancel this request");
    }

    if (request.status !== "pending") {
      throw new HttpException(400, `Request has already been ${request.status}`);
    }

    return await swapRequestRepository.updateStatus(requestId, data.status);
  }
}
