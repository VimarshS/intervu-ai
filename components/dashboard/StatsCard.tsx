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
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1 pt-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.value > 0
                      ? "text-green-500"
                      : trend.value < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}