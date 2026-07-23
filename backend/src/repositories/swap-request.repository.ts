import { ISwapRequest, SwapRequestModel } from "../models/swap-request.model";

export class SwapRequestRepository {
  async createRequest(data: Partial<ISwapRequest>): Promise<ISwapRequest> {
    const request = new SwapRequestModel(data);
    return await request.save();
  }

  async findById(id: string): Promise<ISwapRequest | null> {
    return await SwapRequestModel.findById(id)
      .populate("senderId", "firstName lastName email imageUrl")
      .populate("receiverId", "firstName lastName email imageUrl");
  }

  async findReceivedRequests(receiverId: string): Promise<ISwapRequest[]> {
    return await SwapRequestModel.find({ receiverId })
      .populate("senderId", "firstName lastName email imageUrl")
      .sort({ createdAt: -1 });
  }

  async findSentRequests(senderId: string): Promise<ISwapRequest[]> {
    return await SwapRequestModel.find({ senderId })
      .populate("receiverId", "firstName lastName email imageUrl")
      .sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: ISwapRequest["status"]): Promise<ISwapRequest | null> {
    return await SwapRequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("senderId receiverId", "firstName lastName email imageUrl");
  }

  async findExistingRequest(senderId: string, receiverId: string, status: ISwapRequest["status"] = "pending"): Promise<ISwapRequest | null> {
    return await SwapRequestModel.findOne({ senderId, receiverId, status });
  }
}
