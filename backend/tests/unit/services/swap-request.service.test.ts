const repository = { findExistingRequest: jest.fn(), createRequest: jest.fn(), findReceivedRequests: jest.fn(), findSentRequests: jest.fn(), findById: jest.fn(), updateStatus: jest.fn(), findAll: jest.fn() };
const createNotification = jest.fn();
const createSessions = jest.fn();
jest.mock("../../../src/repositories/swap-request.repository", () => ({ SwapRequestRepository: jest.fn(() => repository) }));
jest.mock("../../../src/services/notification.service", () => ({ notificationService: { createNotification } }));
jest.mock("../../../src/models/session.model", () => ({ SessionModel: { create: createSessions } }));
import { SwapRequestService } from "../../../src/services/swap-request.service";

const sender = "507f1f77bcf86cd799439011", receiver = "507f1f77bcf86cd799439012";
const request = (status = "pending") => ({ senderId: { _id: { toString: () => sender } }, receiverId: { _id: { toString: () => receiver } }, skillOffered: "Node", skillWanted: "UX", status });

describe("SwapRequestService", () => {
  const service = new SwapRequestService();
  beforeEach(() => jest.clearAllMocks());
  it("covers request creation, duplicates, listings, and every status permission path", async () => {
    await expect(service.sendRequest(sender, { receiverId: sender, skillOffered: "Node", skillWanted: "UX" } as any)).rejects.toMatchObject({ status: 400 });
    repository.findExistingRequest.mockResolvedValueOnce({});
    await expect(service.sendRequest(sender, { receiverId: receiver, skillOffered: "Node", skillWanted: "UX" } as any)).rejects.toMatchObject({ status: 400 });
    repository.findExistingRequest.mockResolvedValueOnce(null); repository.createRequest.mockResolvedValueOnce({ _id: "r1" });
    await service.sendRequest(sender, { receiverId: receiver, skillOffered: "Node", skillWanted: "UX" } as any);
    repository.findReceivedRequests.mockResolvedValueOnce([]); repository.findSentRequests.mockResolvedValueOnce([]); repository.findAll.mockResolvedValueOnce([]);
    await service.getReceivedRequests(receiver); await service.getSentRequests(sender); await service.getAllRequests();

    repository.findById.mockResolvedValueOnce(null);
    await expect(service.respondToRequest(receiver, "missing", { status: "accepted" } as any)).rejects.toMatchObject({ status: 404 });
    repository.findById.mockResolvedValueOnce(request());
    await expect(service.respondToRequest(sender, "r1", { status: "accepted" } as any)).rejects.toMatchObject({ status: 403 });
    repository.findById.mockResolvedValueOnce(request());
    await expect(service.respondToRequest(receiver, "r1", { status: "cancelled" } as any)).rejects.toMatchObject({ status: 403 });
    repository.findById.mockResolvedValueOnce(request("pending"));
    await expect(service.respondToRequest("other", "r1", { status: "completed" } as any)).rejects.toMatchObject({ status: 403 });
    repository.findById.mockResolvedValueOnce(request("pending"));
    await expect(service.respondToRequest(sender, "r1", { status: "completed" } as any)).rejects.toMatchObject({ status: 400 });
    repository.findById.mockResolvedValueOnce(request("accepted"));
    await expect(service.respondToRequest(receiver, "r1", { status: "declined" } as any)).rejects.toMatchObject({ status: 400 });
  });

  it("creates sessions and notifications for accepted, declined, and completed requests", async () => {
    for (const [status, actor, state] of [["accepted", receiver, "pending"], ["declined", receiver, "pending"], ["completed", sender, "accepted"]] as const) {
      repository.findById.mockResolvedValueOnce(request(state)); repository.updateStatus.mockResolvedValueOnce({ status });
      await service.respondToRequest(actor, "r1", { status } as any);
    }
    expect(createSessions).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledTimes(3);
  });
});
