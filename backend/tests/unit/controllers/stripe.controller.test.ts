const stripeService = {
  createCheckoutSession: jest.fn(),
  verifySession: jest.fn(),
  handleWebhook: jest.fn(),
};

jest.mock("../../../src/services/stripe.service", () => ({ StripeService: jest.fn(() => stripeService) }));

import { StripeController } from "../../../src/controllers/stripe.controller";

const response = () => {
  const send = jest.fn();
  const json = jest.fn();
  const status = jest.fn(() => ({ send, json }));
  return { status, send, json } as any;
};

describe("StripeController", () => {
  const controller = new StripeController();
  beforeEach(() => jest.clearAllMocks());

  it("requires a signed-in user before creating a checkout session", async () => {
    const res = response();
    await controller.createCheckoutSession({} as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("creates a checkout session and reports service failures", async () => {
    stripeService.createCheckoutSession.mockResolvedValueOnce({ url: "https://checkout.test" });
    const success = response();
    await controller.createCheckoutSession({ user: { _id: "u1", email: "a@example.com" } } as any, success);
    expect(success.status).toHaveBeenCalledWith(200);

    stripeService.createCheckoutSession.mockRejectedValueOnce(new Error("Stripe unavailable"));
    const failure = response();
    await controller.createCheckoutSession({ user: { _id: "u1", email: "a@example.com" } } as any, failure);
    expect(failure.status).toHaveBeenCalledWith(500);
  });

  it("validates and verifies checkout sessions", async () => {
    const unauthorized = response();
    await controller.verifySession({ body: {} } as any, unauthorized);
    expect(unauthorized.status).toHaveBeenCalledWith(401);

    const missing = response();
    await controller.verifySession({ user: { _id: "u1" }, body: {} } as any, missing);
    expect(missing.status).toHaveBeenCalledWith(400);

    stripeService.verifySession.mockResolvedValueOnce(true);
    const complete = response();
    await controller.verifySession({ user: { _id: "u1" }, body: { sessionId: "cs_paid" } } as any, complete);
    expect(complete.status).toHaveBeenCalledWith(200);

    stripeService.verifySession.mockResolvedValueOnce(false);
    const unpaid = response();
    await controller.verifySession({ user: { _id: "u1" }, body: { sessionId: "cs_unpaid" } } as any, unpaid);
    expect(unpaid.status).toHaveBeenCalledWith(400);
  });

  it("rejects unsigned webhooks and accepts verified events", async () => {
    const missingSignature = response();
    await controller.handleWebhook({ headers: {}, body: Buffer.from("raw") } as any, missingSignature);
    expect(missingSignature.status).toHaveBeenCalledWith(400);

    const complete = response();
    stripeService.handleWebhook.mockResolvedValueOnce(undefined);
    await controller.handleWebhook({ headers: { "stripe-signature": "sig" }, body: Buffer.from("raw") } as any, complete);
    expect(complete.status).toHaveBeenCalledWith(200);

    const invalid = response();
    stripeService.handleWebhook.mockRejectedValueOnce(new Error("Invalid signature"));
    await controller.handleWebhook({ headers: { "stripe-signature": "sig" }, body: Buffer.from("raw") } as any, invalid);
    expect(invalid.status).toHaveBeenCalledWith(400);
  });
});
