 "use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

interface SkillRadarProps {
  data: RadarDataPoint[];
}

export function SkillRadar({ data }: SkillRadarProps) {
  const hasData = data.some((d) => d.score > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Complete interviews to see your skill radar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart
        data={data}
        margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
      >
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 10 }}
          tickCount={4}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [`${value}/10`, "Score"]}
        />
        <Radar
          name="Skills"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}