"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Coins, AlertTriangle } from "lucide-react";

interface Credits {
  free_credits: number;
  paid_credits: number;
  total: number;
}

export function CreditsDisplay() {
  const [credits, setCredits] = useState<Credits | null>(null);

  async function fetchCredits() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("free_credits, paid_credits")
      .eq("id", user.id)
      .single();

    if (data) {
      setCredits({
        free_credits: data.free_credits,
        paid_credits: data.paid_credits,
        total: data.free_credits + data.paid_credits,
      });
    }
  }

  useEffect(() => {
    fetchCredits();

    // Re-fetch every 10 seconds to catch deductions
    const interval = setInterval(fetchCredits, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!credits) return null;

  const { total } = credits;
  const isLow = total <= 2 && total > 0;
  const isEmpty = total === 0;

  return (
    <div className="flex items-center gap-1.5">
      {isEmpty ? (
        <Badge
          variant="outline"
          className="border-red-500/30 text-red-400 bg-red-500/10 gap-1.5 px-2.5 py-1"
        >
          <AlertTriangle className="h-3 w-3" />
          No credits
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className={`gap-1.5 px-2.5 py-1 ${
            isLow
              ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
              : "border-slate-700 text-slate-300 bg-slate-800"
          }`}
        >
          <Coins className="h-3 w-3" />
          {total} credit{total !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
}