import Stripe from "stripe";
import { UserModel } from "../models/user.model";
import { FRONTEND_URL, STRIPE_PRICE_ID, STRIPE_SECRET_KEY } from "../configs/constant";

export class StripeService {
  /**
   * Creates a Stripe checkout session for subscribing to the "Pro" plan
   */
  async createCheckoutSession(userId: string, email: string) {
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const frontendUrl = FRONTEND_URL || "http://localhost:3000";
    const priceId = STRIPE_PRICE_ID;

    if (!priceId) {
      throw new Error("Stripe Price ID is not configured on the server.");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/dashboard/subscription?canceled=true`,
    });

    return session;
  }

  /**
   * Verifies a session directly without relying on webhooks (useful for local dev)
   */
  async verifySession(sessionId: string, userId: string) {
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      await UserModel.findByIdAndUpdate(userId, {
        subscriptionStatus: "pro",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      });
      return true;
    }
    return false;
  }

  /**
   * Handles Stripe webhooks securely
   */
  async handleWebhook(rawBody: string | Buffer, signature: string) {
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error("Stripe Webhook Secret is not configured.");
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id) {
          // The user has subscribed!
          await UserModel.findByIdAndUpdate(session.client_reference_id, {
            subscriptionStatus: "pro",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          });
        }
        break;

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        // The user cancelled their subscription
        await UserModel.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { subscriptionStatus: "free" }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
