"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
import { ProgressChart } from "./ProgressChart";
import { SkillRadar } from "./SkillRadar";
import { useProgress } from "@/hooks/useProgress";
import { Loader2 } from "lucide-react";

export function ProgressChartWrapper() {
  const { data, isLoading, error } = useProgress();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="py-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Score Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart data={data?.chartData ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Skill Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillRadar data={data?.radarData ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}