import { Request, Response } from "express";
import { StripeService } from "../services/stripe.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class StripeController {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = new StripeService();
    this.createCheckoutSession = this.createCheckoutSession.bind(this);
    this.handleWebhook = this.handleWebhook.bind(this);
    this.verifySession = this.verifySession.bind(this);
  }

  async verifySession(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }
      const { sessionId } = req.body;
      if (!sessionId) {
        return ApiResponseHelper.error(res, "Session ID is required", 400);
      }
      const success = await this.stripeService.verifySession(sessionId, req.user._id.toString());
      if (success) {
        return ApiResponseHelper.success(res, { success: true }, "Subscription verified successfully");
      }
      return ApiResponseHelper.error(res, "Payment not completed", 400);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Failed to verify session", 500);
    }
  }

  async createCheckoutSession(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      const session = await this.stripeService.createCheckoutSession(
        req.user._id.toString(),
        req.user.email
      );

      return ApiResponseHelper.success(
        res,
        { url: session.url },
        "Checkout session created successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Failed to create checkout session",
        500
      );
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).send("Webhook Error: Missing stripe-signature header");
    }

    try {
      // req.body must be raw buffer for Stripe to verify
      await this.stripeService.handleWebhook(req.body, signature);
      return res.status(200).send({ received: true });
    } catch (error: any) {
      console.error("Stripe webhook error:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}
