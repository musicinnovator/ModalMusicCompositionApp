// ADDITIVE: Subscription Management Routes
// Handles user subscription status, export tracking, and payment webhooks

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const subscriptionApp = new Hono();

// Get user subscription
subscriptionApp.get("/subscription/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId || userId === 'anonymous') {
      return c.json({
        subscription: {
          user_id: 'anonymous',
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // Get subscription from KV store
    const subscriptionKey = `subscription:${userId}`;
    const subscription = await kv.get(subscriptionKey);

    if (!subscription) {
      // Create default free subscription
      const defaultSubscription = {
        user_id: userId,
        subscription_tier: 'free',
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await kv.set(subscriptionKey, defaultSubscription);
      return c.json({ subscription: defaultSubscription });
    }

    return c.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return c.json({ error: "Failed to fetch subscription" }, 500);
  }
});

// Update user subscription (for internal use or webhook)
subscriptionApp.post("/subscription/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();

    const subscription = {
      user_id: userId,
      subscription_tier: body.subscription_tier || 'free',
      subscription_status: body.subscription_status || 'active',
      payment_provider: body.payment_provider,
      stripe_customer_id: body.stripe_customer_id,
      stripe_subscription_id: body.stripe_subscription_id,
      paypal_subscription_id: body.paypal_subscription_id,
      current_period_start: body.current_period_start,
      current_period_end: body.current_period_end,
      cancel_at_period_end: body.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
      created_at: body.created_at || new Date().toISOString()
    };

    const subscriptionKey = `subscription:${userId}`;
    await kv.set(subscriptionKey, subscription);

    return c.json({ success: true, subscription });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return c.json({ error: "Failed to update subscription" }, 500);
  }
});

// Get export count for today (free tier only)
subscriptionApp.get("/export-count/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const exportKey = `exports:${userId}:${today}`;

    const exportData = await kv.get(exportKey);
    const count = exportData?.count || 0;
    const limit = 3; // Free tier limit

    return c.json({ count, limit, remaining: Math.max(0, limit - count) });
  } catch (error) {
    console.error("Error fetching export count:", error);
    return c.json({ error: "Failed to fetch export count" }, 500);
  }
});

// Increment export count
subscriptionApp.post("/increment-export", async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.userId || 'anonymous';
    const today = new Date().toISOString().split('T')[0];
    const exportKey = `exports:${userId}:${today}`;

    const exportData = await kv.get(exportKey);
    const currentCount = exportData?.count || 0;

    await kv.set(exportKey, {
      count: currentCount + 1,
      date: today,
      last_export: new Date().toISOString()
    });

    return c.json({ success: true, count: currentCount + 1 });
  } catch (error) {
    console.error("Error incrementing export count:", error);
    return c.json({ error: "Failed to increment export count" }, 500);
  }
});

// Stripe webhook handler
subscriptionApp.post("/webhook/stripe", async (c) => {
  try {
    const body = await c.req.json();
    const event = body;

    console.log("Stripe webhook received:", event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error("No user_id in subscription metadata");
          return c.json({ error: "Missing user_id" }, 400);
        }

        // Determine tier from price_id or product
        let tier = 'premium';
        if (subscription.items?.data?.[0]?.price?.product) {
          const productId = subscription.items.data[0].price.product;
          // Map product IDs to tiers (configure these in your Stripe dashboard)
          if (productId.includes('pro')) tier = 'pro';
          else if (productId.includes('premium')) tier = 'premium';
        }

        await kv.set(`subscription:${userId}`, {
          user_id: userId,
          subscription_tier: tier,
          subscription_status: subscription.status,
          payment_provider: 'stripe',
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error("No user_id in subscription metadata");
          return c.json({ error: "Missing user_id" }, 400);
        }

        // Downgrade to free tier
        await kv.set(`subscription:${userId}`, {
          user_id: userId,
          subscription_tier: 'free',
          subscription_status: 'canceled',
          payment_provider: 'stripe',
          stripe_customer_id: subscription.customer,
          updated_at: new Date().toISOString()
        });

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// PayPal webhook handler
subscriptionApp.post("/webhook/paypal", async (c) => {
  try {
    const body = await c.req.json();
    const event = body;

    console.log("PayPal webhook received:", event.event_type);

    // Handle different event types
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const subscription = event.resource;
        const userId = subscription.custom_id; // Store user_id in custom_id

        if (!userId) {
          console.error("No user_id in subscription custom_id");
          return c.json({ error: "Missing user_id" }, 400);
        }

        // Determine tier from plan_id
        let tier = 'premium';
        if (subscription.plan_id?.includes('pro')) tier = 'pro';
        else if (subscription.plan_id?.includes('premium')) tier = 'premium';

        await kv.set(`subscription:${userId}`, {
          user_id: userId,
          subscription_tier: tier,
          subscription_status: 'active',
          payment_provider: 'paypal',
          paypal_subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        });

        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscription = event.resource;
        const userId = subscription.custom_id;

        if (!userId) {
          console.error("No user_id in subscription custom_id");
          return c.json({ error: "Missing user_id" }, 400);
        }

        // Downgrade to free tier
        await kv.set(`subscription:${userId}`, {
          user_id: userId,
          subscription_tier: 'free',
          subscription_status: 'canceled',
          payment_provider: 'paypal',
          updated_at: new Date().toISOString()
        });

        break;
      }

      default:
        console.log("Unhandled PayPal event type:", event.event_type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

export default subscriptionApp;
