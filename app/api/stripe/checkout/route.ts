import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const CREDITS_MAP = {
  credits: 20,
  monthly: 30,
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { priceType } = body as { priceType: "credits" | "monthly" };

    if (!priceType || !["credits", "monthly"].includes(priceType)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Read env vars inside the function — guaranteed to be loaded
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const PRICE_IDS: Record<string, string> = {
      credits: process.env.STRIPE_CREDITS_PRICE_ID!,
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
    };

    if (!PRICE_IDS[priceType]) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_IDS[priceType],
          quantity: 1,
        },
      ],
      mode: priceType === "monthly" ? "subscription" : "payment",
      success_url: `${siteUrl}/dashboard?payment=success&credits=${CREDITS_MAP[priceType]}`,
      cancel_url: `${siteUrl}/dashboard?payment=cancelled`,
      metadata: {
        user_id: user.id,
        price_type: priceType,
        credits_to_add: String(CREDITS_MAP[priceType as keyof typeof CREDITS_MAP]),
      },
      customer_email: user.email ?? undefined,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}