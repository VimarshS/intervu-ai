import { getCredits } from "@/lib/credits/deductCredit";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Coins, AlertTriangle } from "lucide-react";

export async function CreditsDisplay() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const credits = await getCredits(user.id);

  if (!credits) return null;

  const total = credits.total;
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