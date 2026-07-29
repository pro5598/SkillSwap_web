const create = jest.fn(); const retrieve = jest.fn(); const constructEvent = jest.fn();
jest.mock("stripe", () => jest.fn().mockImplementation(() => ({ checkout: { sessions: { create, retrieve } }, webhooks: { constructEvent } })));
jest.mock("../../../src/models/user.model", () => ({ UserModel: { findByIdAndUpdate: jest.fn(), findOneAndUpdate: jest.fn() } }));

import { UserModel } from "../../../src/models/user.model";
import { StripeService } from "../../../src/services/stripe.service";

describe("StripeService", () => {
  const service = new StripeService();
  beforeEach(() => { jest.clearAllMocks(); });

  it("creates a subscription checkout session", async () => {
    create.mockResolvedValue({ id: "cs_1", url: "https://checkout.test" });
    await expect(service.createCheckoutSession("u1", "a@example.com")).resolves.toEqual(expect.objectContaining({ url: expect.any(String) }));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ mode: "subscription", customer_email: "a@example.com" }));
  });

  it("updates a user only after a paid checkout", async () => {
    retrieve.mockResolvedValue({ payment_status: "paid", customer: "cus_1", subscription: "sub_1" });
    await expect(service.verifySession("cs_1", "u1")).resolves.toBe(true); expect(UserModel.findByIdAndUpdate).toHaveBeenCalled();
    retrieve.mockResolvedValue({ payment_status: "unpaid" }); await expect(service.verifySession("cs_2", "u1")).resolves.toBe(false);
  });

  it("processes checkout and cancelled-subscription webhook events", async () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET; process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    constructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: { client_reference_id: "u1", customer: "cus", subscription: "sub" } } });
    await service.handleWebhook("raw", "sig"); expect(UserModel.findByIdAndUpdate).toHaveBeenCalled();
    constructEvent.mockReturnValue({ type: "customer.subscription.deleted", data: { object: { id: "sub" } } });
    await service.handleWebhook("raw", "sig"); expect(UserModel.findOneAndUpdate).toHaveBeenCalled();
    constructEvent.mockImplementation(() => { throw new Error("invalid signature"); }); await expect(service.handleWebhook("raw", "sig")).rejects.toThrow("Webhook Error");
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });
});
