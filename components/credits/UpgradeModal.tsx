"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Zap,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: "credits",
    name: "Credits Pack",
    price: "₹49",
    credits: 20,
    description: "One-time purchase",
    features: [
      "20 interview credits",
      "Never expires",
      "Use for any feature",
      "Instant activation",
    ],
    badge: "Best for trying out",
    badgeColor: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
    buttonStyle: "bg-indigo-600 hover:bg-indigo-500 text-white border-0",
    priceType: "credits" as const,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "₹99",
    credits: 30,
    description: "Per month",
    features: [
      "30 credits every month",
      "Auto-renews monthly",
      "Priority AI responses",
      "Instant activation",
    ],
    badge: "Best value",
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    buttonStyle: "bg-emerald-600 hover:bg-emerald-500 text-white border-0",
    priceType: "monthly" as const,
  },
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(priceType: "credits" | "monthly") {
    setLoadingPlan(priceType);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to start checkout. Please try again.");
        setLoadingPlan(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="bg-slate-900 border-slate-700 w-[calc(100vw-2rem)] max-w-md mx-auto rounded-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Coins className="h-4 w-4 text-indigo-400" />
          </div>
          <DialogTitle
            className="text-slate-100"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Get More Credits
          </DialogTitle>
        </div>
        <DialogDescription className="text-slate-400 text-sm mt-2">
          You have used all your free credits. Choose a plan to
          keep practicing.
        </DialogDescription>
      </DialogHeader>

      {/* Free credits reminder */}
      <div className="rounded-lg bg-slate-800 border border-slate-700 p-3 flex items-center gap-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <p className="text-xs text-slate-400">
          You already used your{" "}
          <span className="text-slate-200 font-medium">
            5 free credits
          </span>{" "}
          — that is a great start. Keep going.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className="font-semibold text-slate-100 text-sm"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {plan.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {plan.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-xl font-bold text-slate-100"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {plan.price}
                </p>
                <p className="text-xs text-slate-500">
                  {plan.credits} credits
                </p>
              </div>
            </div>

            <ul className="space-y-1">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <Zap className="h-3 w-3 text-indigo-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${plan.buttonStyle}`}
              onClick={() => handleUpgrade(plan.priceType)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === plan.priceType ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loadingPlan === plan.priceType
                ? "Redirecting to payment..."
                : `Get ${plan.credits} Credits for ${plan.price}`}
            </Button>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2">
          <X className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center pb-1">
        Secure payment via Stripe · Cancel anytime
      </p>
    </DialogContent>
  </Dialog>
);
}