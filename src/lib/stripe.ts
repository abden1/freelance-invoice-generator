import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder", {
  apiVersion: "2024-06-20",
});

export const PLAN_PRICES = {
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  BUSINESS: process.env.STRIPE_BUSINESS_PRICE_ID!,
};

export async function createOrRetrieveCustomer(userId: string, email: string): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: "FREE", stripeCustomerId: customer.id },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  plan: "PRO" | "BUSINESS"
): Promise<string> {
  const customerId = await createOrRetrieveCustomer(userId, email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgrade=success&plan=${plan}`,
    cancel_url: `${appUrl}/settings/billing?upgrade=cancelled`,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return session.url!;
}

export async function createPortalSession(userId: string): Promise<string> {
  const { prisma } = await import("@/lib/prisma");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  });

  return session.url;
}
