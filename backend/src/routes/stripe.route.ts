import { Router } from "express";
import { StripeController } from "../controllers/stripe.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import express from "express";

export const stripeRouter = Router();
const stripeController = new StripeController();

// Checkout needs to be authorized
stripeRouter.post(
  "/checkout",
  authorizedMiddleware,
  stripeController.createCheckoutSession
);

stripeRouter.post(
  "/verify",
  authorizedMiddleware,
  stripeController.verifySession
);

// Webhook must be public and use express.raw to preserve the raw body
stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);
