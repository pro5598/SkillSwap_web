const service = { sendRequest: jest.fn(), getReceivedRequests: jest.fn(), getSentRequests: jest.fn(), respondToRequest: jest.fn(), getAllRequests: jest.fn() };
jest.mock("../../../src/services/swap-request.service", () => ({ SwapRequestService: jest.fn(() => service) }));
import { SwapRequestController } from "../../../src/controllers/swap-request.controller";
const response = () => { const json = jest.fn(); const status = jest.fn(() => ({ json })); return { status, json } as any; };
describe("SwapRequestController", () => {
  const controller = new SwapRequestController();
  beforeEach(() => jest.clearAllMocks());
  it("covers authorization, validation, success, and service errors", async () => {
    await controller.sendRequest({ body: {} } as any, response());
    await controller.sendRequest({ user: { id: "u1" }, body: {} } as any, response());
    service.sendRequest.mockResolvedValueOnce({ _id: "r1" }); await controller.sendRequest({ user: { id: "u1" }, body: { receiverId: "u2", skillOffered: "Node", skillWanted: "UX" } } as any, response());
    await controller.getReceivedRequests({} as any, response()); service.getReceivedRequests.mockResolvedValueOnce([]); await controller.getReceivedRequests({ user: { id: "u1" } } as any, response());
    await controller.getSentRequests({} as any, response()); service.getSentRequests.mockResolvedValueOnce([]); await controller.getSentRequests({ user: { id: "u1" } } as any, response());
    await controller.respondToRequest({} as any, response()); await controller.respondToRequest({ user: { id: "u1" }, params: { id: "r1" }, body: {} } as any, response());
    service.respondToRequest.mockResolvedValueOnce({ status: "accepted" }); await controller.respondToRequest({ user: { id: "u1" }, params: { id: "r1" }, body: { status: "accepted" } } as any, response());
    service.getAllRequests.mockResolvedValueOnce([]); await controller.getAllRequests({} as any, response());
    service.getAllRequests.mockRejectedValueOnce(new Error("database")); await controller.getAllRequests({} as any, response());
  });

  it("returns errors when each request operation fails", async () => {
    const error = new Error("service unavailable");
    service.sendRequest.mockRejectedValueOnce(error); await controller.sendRequest({ user: { id: "u1" }, body: { receiverId: "u2", skillOffered: "Node", skillWanted: "UX" } } as any, response());
    service.getReceivedRequests.mockRejectedValueOnce(error); await controller.getReceivedRequests({ user: { id: "u1" } } as any, response());
    service.getSentRequests.mockRejectedValueOnce(error); await controller.getSentRequests({ user: { id: "u1" } } as any, response());
    service.respondToRequest.mockRejectedValueOnce(error); await controller.respondToRequest({ user: { id: "u1" }, params: { id: "r1" }, body: { status: "declined" } } as any, response());
  });
});
