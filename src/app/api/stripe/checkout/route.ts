import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession, PLAN_PRICES } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  if (!plan || !["PRO", "BUSINESS"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      PLAN_PRICES[plan as "PRO" | "BUSINESS"],
      plan as "PRO" | "BUSINESS"
    );
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
