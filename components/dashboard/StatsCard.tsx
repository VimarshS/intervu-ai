import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = "text-indigo-400",
  iconBg = "bg-indigo-500/10",
  trend,
}: StatsCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {label}
            </p>
            <p
              className="text-2xl font-bold text-slate-50 tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-slate-500">{subtext}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1 pt-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.value > 0
                      ? "text-emerald-400"
                      : trend.value < 0
                      ? "text-red-400"
                      : "text-slate-500"
                  )}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}
                </span>
                <span className="text-xs text-slate-500">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-700/50",
              iconBg
            )}
          >
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}