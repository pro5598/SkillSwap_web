const sessionSave = jest.fn();
const SessionModel: any = jest.fn(() => ({ save: sessionSave }));
SessionModel.findById = jest.fn(); SessionModel.find = jest.fn();
const MessageModel = { find: jest.fn(), updateMany: jest.fn(), countDocuments: jest.fn() };
const ReviewModel = { create: jest.fn(), find: jest.fn(), findOne: jest.fn() };
const SwapRequestModel = { findById: jest.fn() };

jest.mock("../../../src/models/session.model", () => ({ SessionModel }));
jest.mock("../../../src/models/message.model", () => ({ MessageModel }));
jest.mock("../../../src/models/review.model", () => ({ ReviewModel }));
jest.mock("../../../src/models/swap-request.model", () => ({ SwapRequestModel }));
jest.mock("../../../src/services/notification.service", () => ({ notificationService: { createNotification: jest.fn() } }));

import * as sessions from "../../../src/controllers/session.controller";
import * as messages from "../../../src/controllers/message.controller";
import * as reviews from "../../../src/controllers/review.controller";

const response = () => { const json = jest.fn(); const status = jest.fn(() => ({ json })); return { status, json } as any; };
const userReq = (body: any = {}, params: any = {}) => ({ body, params, user: { _id: "u1" } } as any);

describe("session, message, and review controllers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates sessions and validates required data", async () => {
    const res = response(); sessionSave.mockResolvedValue(undefined);
    await sessions.createSession(userReq({ providerId: "u2", scheduledAt: "tomorrow" }), res); expect(SessionModel).toHaveBeenCalled(); expect(res.status).toHaveBeenCalledWith(201);
    await sessions.createSession(userReq({}), response());
  });

  it("schedules and updates sessions for participants", async () => {
    const saved = { providerId: "u1", requesterId: "u2", save: sessionSave };
    SessionModel.findById.mockResolvedValue(saved); sessionSave.mockResolvedValue(undefined);
    await sessions.scheduleSession(userReq({ scheduledAt: "tomorrow", meetingDetails: "Zoom" }, { sessionId: "s1" }), response()); expect(sessionSave).toHaveBeenCalled();
    await sessions.updateSessionStatus(userReq({ status: "completed" }, { sessionId: "s1" }), response());
    SessionModel.findById.mockResolvedValue(null); await sessions.scheduleSession(userReq({ scheduledAt: "tomorrow" }, { sessionId: "missing" }), response());
  });

  it("covers session authorization, follow-up, and failure paths", async () => {
    await sessions.scheduleSession({ params: { sessionId: "s1" }, body: { scheduledAt: "tomorrow" } } as any, response());
    await sessions.scheduleSession(userReq({}, { sessionId: "s1" }), response());
    SessionModel.findById.mockResolvedValue({ providerId: "u2", requesterId: "u3", save: sessionSave });
    await sessions.scheduleSession(userReq({ scheduledAt: "tomorrow" }, { sessionId: "s1" }), response());
    await sessions.updateSessionStatus({ params: { sessionId: "s1" }, body: { status: "completed" } } as any, response());
    SessionModel.findById.mockResolvedValue(null);
    await sessions.updateSessionStatus(userReq({ status: "completed" }, { sessionId: "missing" }), response());

    await sessions.createFollowUpSession({ params: { sessionId: "s1" } } as any, response());
    SessionModel.findById.mockResolvedValue({ providerId: "u2", requesterId: "u3" });
    await sessions.createFollowUpSession(userReq({}, { sessionId: "s1" }), response());
    const original = { providerId: "u1", requesterId: "u2", skillName: "Node" };
    SessionModel.findById.mockResolvedValue(original); sessionSave.mockResolvedValue(undefined);
    await sessions.createFollowUpSession(userReq({ scheduledAt: "tomorrow", meetingDetails: "Zoom" }, { sessionId: "s1" }), response());
  });

  it("covers session errors, optional meeting details, and the admin session list", async () => {
    sessionSave.mockRejectedValueOnce(new Error("save failed"));
    await sessions.createSession(userReq({ providerId: "u2", scheduledAt: "tomorrow" }), response());
    const saved = { providerId: "u1", requesterId: "u2", save: sessionSave };
    sessionSave.mockResolvedValue(undefined); SessionModel.findById.mockResolvedValueOnce(saved);
    await sessions.scheduleSession(userReq({ scheduledAt: "tomorrow" }, { sessionId: "s1" }), response());
    SessionModel.findById.mockResolvedValueOnce(saved); await sessions.updateSessionStatus(userReq({ status: "cancelled" }, { sessionId: "s1" }), response());
    const allChain: any = { populate: jest.fn(), sort: jest.fn().mockResolvedValue([]) };
    allChain.populate.mockReturnValue(allChain); SessionModel.find.mockReturnValue(allChain);
    await sessions.getAllSessions({} as any, response());
  });

  it("covers fetch and follow-up failures", async () => {
    SessionModel.find.mockImplementationOnce(() => { throw new Error("query failed"); });
    await sessions.getMySessions(userReq(), response());
    SessionModel.find.mockImplementationOnce(() => { throw new Error("query failed"); });
    await sessions.getAllSessions({} as any, response());
    SessionModel.findById.mockResolvedValueOnce({ providerId: "u1", requesterId: "u2", skillName: "Node" });
    sessionSave.mockRejectedValueOnce(new Error("save failed"));
    await sessions.createFollowUpSession(userReq({}, { sessionId: "s1" }), response());
  });

  it("fetches the current user's sessions", async () => {
    const populate = jest.fn().mockResolvedValue([{}]); SessionModel.find.mockReturnValue({ populate });
    await sessions.getMySessions(userReq(), response()); expect(populate).toHaveBeenCalled();
    await sessions.getMySessions({ user: undefined } as any, response());
  });

  it("fetches, marks, and counts messages", async () => {
    MessageModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) }); MessageModel.updateMany.mockResolvedValue({}); MessageModel.countDocuments.mockResolvedValue(2);
    await messages.getConversation(userReq({}, { userId: "u2" }), response());
    await messages.markAsRead(userReq({ senderId: "u2" }), response());
    await messages.getUnreadCount(userReq(), response());
    await messages.getConversation(userReq({}, {}), response()); await messages.markAsRead(userReq({}), response()); await messages.getUnreadCount({ user: undefined } as any, response());
  });

  it("submits and reads reviews", async () => {
    SwapRequestModel.findById.mockResolvedValue({ status: "completed", senderId: "u1", receiverId: "u2" }); ReviewModel.create.mockResolvedValue({ _id: "r1" });
    await reviews.submitReview(userReq({ swapRequestId: "swap", rating: 5, comment: "great" }), response()); expect(ReviewModel.create).toHaveBeenCalled();
    const reviewList: any = [{ rating: 4 }, { rating: 5 }]; ReviewModel.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(reviewList) }) }); ReviewModel.findOne.mockResolvedValue({});
    await reviews.getReviewsForUser(userReq({}, { userId: "u2" }), response()); await reviews.hasReviewed(userReq({}, { swapRequestId: "swap" }), response());
    await reviews.submitReview(userReq({}), response()); SwapRequestModel.findById.mockResolvedValue(null); await reviews.submitReview(userReq({ swapRequestId: "swap", rating: 5 }), response());
  });
});
