import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.user_id;
  const creditsToAdd = parseInt(
    session.metadata?.credits_to_add ?? "0"
  );
  const priceType = session.metadata?.price_type;

  if (!userId || !creditsToAdd) {
    console.error("Missing metadata in webhook:", session.metadata);
    return NextResponse.json(
      { error: "Missing metadata" },
      { status: 400 }
    );
  }

  try {
    // Use service role client — bypasses RLS for webhook
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: readError } = await supabase
      .from("profiles")
      .select("paid_credits")
      .eq("id", userId)
      .single();

    if (readError || !profile) {
      console.error("Failed to read profile:", readError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        paid_credits: profile.paid_credits + creditsToAdd,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to add credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      );
    }

    const { error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_session_id: session.id,
        credits_added: creditsToAdd,
        amount_paid: session.amount_total ?? 0,
        status: "completed",
      });

    if (subError) {
      console.error("Failed to save subscription record:", subError);
    }

    console.log(
      `Credits added: ${creditsToAdd} for user ${userId} via ${priceType}`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}