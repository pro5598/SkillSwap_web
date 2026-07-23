import { Request, Response } from "express";
import { SwapRequestService } from "../services/swap-request.service";
import { CreateSwapRequestDto, UpdateSwapRequestStatusDto } from "../dtos/swap-request.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class SwapRequestController {
  private swapRequestService: SwapRequestService;

  constructor() {
    this.swapRequestService = new SwapRequestService();

    this.sendRequest = this.sendRequest.bind(this);
    this.getReceivedRequests = this.getReceivedRequests.bind(this);
    this.getSentRequests = this.getSentRequests.bind(this);
    this.respondToRequest = this.respondToRequest.bind(this);
  }

  async sendRequest(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const parsedData = CreateSwapRequestDto.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      const request = await this.swapRequestService.sendRequest(userId.toString(), parsedData.data);
      return ApiResponseHelper.success(res, { request }, "Swap request sent successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getReceivedRequests(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const requests = await this.swapRequestService.getReceivedRequests(userId.toString());
      return ApiResponseHelper.success(res, { requests }, "Received requests retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getSentRequests(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const requests = await this.swapRequestService.getSentRequests(userId.toString());
      return ApiResponseHelper.success(res, { requests }, "Sent requests retrieved successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async respondToRequest(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const { id } = req.params;

      const parsedData = UpdateSwapRequestStatusDto.safeParse(req.body);
      if (!parsedData.success) {
        const fieldErrors = parsedData.error.flatten().fieldErrors;
        const validationErrorMessage = Object.entries(fieldErrors)
          .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
          .join(" | ");
        return ApiResponseHelper.error(res, validationErrorMessage, 400);
      }

      const updatedRequest = await this.swapRequestService.respondToRequest(
        userId.toString(),
        id as string,
        parsedData.data
      );

      return ApiResponseHelper.success(res, { request: updatedRequest }, "Request status updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
