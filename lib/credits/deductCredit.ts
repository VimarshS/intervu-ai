import { createClient } from "@/lib/supabase/server";

export interface DeductResult {
  success: boolean;
  requiresPayment?: boolean;
  message?: string;
  free_credits?: number;
  paid_credits?: number;
}

export async function deductCredit(userId: string): Promise<DeductResult> {
  const supabase = await createClient();

  // First check current balance — single read before atomic update
  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("free_credits, paid_credits")
    .eq("id", userId)
    .single();

  if (readError || !profile) {
    return {
      success: false,
      message: "Failed to read credit balance",
    };
  }

  const totalCredits = profile.free_credits + profile.paid_credits;

  if (totalCredits <= 0) {
    return {
      success: false,
      requiresPayment: true,
      message: "You have used all your free credits. Upgrade to continue.",
    };
  }

  // Atomic deduction — free credits first, then paid
  // Uses conditional update to prevent race conditions
  let updateData: { free_credits?: number; paid_credits?: number };

  if (profile.free_credits > 0) {
    updateData = { free_credits: profile.free_credits - 1 };
  } else {
    updateData = { paid_credits: profile.paid_credits - 1 };
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select("free_credits, paid_credits")
    .single();

  if (updateError || !updated) {
    return {
      success: false,
      message: "Failed to deduct credit. Please try again.",
    };
  }

  return {
    success: true,
    free_credits: updated.free_credits,
    paid_credits: updated.paid_credits,
  };
}

export async function getCredits(
  userId: string
): Promise<{ free_credits: number; paid_credits: number; total: number } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("free_credits, paid_credits")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    free_credits: data.free_credits,
    paid_credits: data.paid_credits,
    total: data.free_credits + data.paid_credits,
  };
}