import request from "supertest";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { JWT_SECRET } from "../../src/configs/constant";
import { UserModel } from "../../src/models/user.model";
import { SwapRequestModel } from "../../src/models/swap-request.model";
import { SessionModel } from "../../src/models/session.model";
import { MessageModel } from "../../src/models/message.model";
import { NotificationModel } from "../../src/models/notification.model";

async function createUser(label: string) {
  const user = await UserModel.create({
    firstName: label,
    lastName: "Tester",
    email: `${label.toLowerCase()}@test.dev`,
    username: `${label.toLowerCase()}_tester`,
    password: await bcryptjs.hash("password123", 10),
  });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  return { user, token };
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

describe("Swap request API", () => {
  it("requires authentication when sending a request", async () => {
    const response = await request(app).post("/api/v1/swap-requests").send({});
    expect(response.status).toBe(401);
  });

  it("creates a request and notifies the receiver", async () => {
    const sender = await createUser("Sender");
    const receiver = await createUser("Receiver");
    const response = await request(app).post("/api/v1/swap-requests").set(bearer(sender.token)).send({
      receiverId: receiver.user._id.toString(), skillOffered: "JavaScript", skillWanted: "Design",
    });
    expect(response.status).toBe(201);
    expect(await NotificationModel.countDocuments({ recipient: receiver.user._id, type: "swap_request" })).toBe(1);
  });

  it("rejects a request to the sender", async () => {
    const user = await createUser("Self");
    const response = await request(app).post("/api/v1/swap-requests").set(bearer(user.token)).send({
      receiverId: user.user._id.toString(), skillOffered: "JavaScript", skillWanted: "Design",
    });
    expect(response.status).toBe(400);
  });

  it("returns sent and received requests for the appropriate users", async () => {
    const sender = await createUser("Sent");
    const receiver = await createUser("Received");
    await SwapRequestModel.create({ senderId: sender.user._id, receiverId: receiver.user._id, skillOffered: "Node", skillWanted: "UX" });
    const [sent, received] = await Promise.all([
      request(app).get("/api/v1/swap-requests/sent").set(bearer(sender.token)),
      request(app).get("/api/v1/swap-requests/received").set(bearer(receiver.token)),
    ]);
    expect(sent.body.data.requests).toHaveLength(1);
    expect(received.body.data.requests).toHaveLength(1);
  });

  it("allows only the receiver to accept and creates two sessions", async () => {
    const sender = await createUser("Offerer");
    const receiver = await createUser("Acceptor");
    const swap = await SwapRequestModel.create({ senderId: sender.user._id, receiverId: receiver.user._id, skillOffered: "Node", skillWanted: "UX" });
    const response = await request(app).patch(`/api/v1/swap-requests/${swap._id}/status`).set(bearer(receiver.token)).send({ status: "accepted" });
    expect(response.status).toBe(200);
    expect(response.body.data.request.status).toBe("accepted");
    expect(await SessionModel.countDocuments()).toBe(2);
  });

  it("prevents the sender from accepting their own request", async () => {
    const sender = await createUser("NoAccept");
    const receiver = await createUser("Target");
    const swap = await SwapRequestModel.create({ senderId: sender.user._id, receiverId: receiver.user._id, skillOffered: "Node", skillWanted: "UX" });
    const response = await request(app).patch(`/api/v1/swap-requests/${swap._id}/status`).set(bearer(sender.token)).send({ status: "accepted" });
    expect(response.status).toBe(403);
  });
});

describe("Sessions, reviews, messages, and notifications", () => {
  it("creates a session for an authenticated user", async () => {
    const requester = await createUser("Requester");
    const provider = await createUser("Provider");
    const response = await request(app).post("/api/v1/sessions").set(bearer(requester.token)).send({ providerId: provider.user._id.toString(), scheduledAt: "2026-08-01T10:00:00.000Z" });
    expect(response.status).toBe(201);
  });

  it("validates required session fields", async () => {
    const user = await createUser("MissingSession");
    const response = await request(app).post("/api/v1/sessions").set(bearer(user.token)).send({});
    expect(response.status).toBe(400);
  });

  it("shows a participant their sessions", async () => {
    const requester = await createUser("MySessions");
    const provider = await createUser("SessionProvider");
    await SessionModel.create({ requesterId: requester.user._id, providerId: provider.user._id });
    const response = await request(app).get("/api/v1/sessions").set(bearer(requester.token));
    expect(response.status).toBe(200);
    expect(response.body.data.sessions).toHaveLength(1);
  });

  it("submits a review after a completed swap", async () => {
    const reviewer = await createUser("Reviewer");
    const reviewee = await createUser("Reviewee");
    const swap = await SwapRequestModel.create({ senderId: reviewer.user._id, receiverId: reviewee.user._id, skillOffered: "Node", skillWanted: "UX", status: "completed" });
    const response = await request(app).post("/api/v1/reviews").set(bearer(reviewer.token)).send({ swapRequestId: swap._id.toString(), rating: 5, comment: "Excellent" });
    expect(response.status).toBe(201);
    expect(response.body.data.review.revieweeId).toBe(reviewee.user._id.toString());
  });

  it("rejects reviews for incomplete swaps", async () => {
    const reviewer = await createUser("EarlyReviewer");
    const reviewee = await createUser("EarlyReviewee");
    const swap = await SwapRequestModel.create({ senderId: reviewer.user._id, receiverId: reviewee.user._id, skillOffered: "Node", skillWanted: "UX" });
    const response = await request(app).post("/api/v1/reviews").set(bearer(reviewer.token)).send({ swapRequestId: swap._id.toString(), rating: 5 });
    expect(response.status).toBe(400);
  });

  it("reports whether the current user has reviewed a swap", async () => {
    const reviewer = await createUser("ReviewStatus");
    const reviewee = await createUser("ReviewStatusPeer");
    const swap = await SwapRequestModel.create({ senderId: reviewer.user._id, receiverId: reviewee.user._id, skillOffered: "Node", skillWanted: "UX", status: "completed" });
    const response = await request(app).get(`/api/v1/reviews/swap-request/${swap._id}/me`).set(bearer(reviewer.token));
    expect(response.status).toBe(200);
    expect(response.body.data.reviewed).toBe(false);
  });

  it("returns a conversation and its unread count", async () => {
    const sender = await createUser("MessageSender");
    const receiver = await createUser("MessageReceiver");
    await MessageModel.create({ senderId: sender.user._id, receiverId: receiver.user._id, content: "Hello" });
    const [conversation, unread] = await Promise.all([
      request(app).get(`/api/v1/messages/conversation/${sender.user._id}`).set(bearer(receiver.token)),
      request(app).get("/api/v1/messages/unread-count").set(bearer(receiver.token)),
    ]);
    expect(conversation.body.data).toHaveLength(1);
    expect(unread.body.data.count).toBe(1);
  });

  it("lists and marks a user's notifications as read", async () => {
    const user = await createUser("Notify");
    const notification = await NotificationModel.create({ recipient: user.user._id, type: "system", content: "Welcome" });
    const listed = await request(app).get("/api/v1/notifications").set(bearer(user.token));
    const marked = await request(app).put(`/api/v1/notifications/${notification._id}/read`).set(bearer(user.token));
    expect(listed.body.data.unreadCount).toBe(1);
    expect(marked.status).toBe(200);
  });
});
