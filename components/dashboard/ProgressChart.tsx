"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SessionDataPoint } from "@/hooks/useProgress";

interface ProgressChartProps {
  data: SessionDataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Complete interviews to see your progress chart
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Complete at least 2 interviews to see your trend line
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <YAxis
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
        />
        <Line
          type="monotone"
          dataKey="overall"
          name="Overall"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="technical"
          name="Technical"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={{ r: 3 }}
          strokeDasharray="4 2"
        />
        <Line
          type="monotone"
          dataKey="communication"
          name="Communication"
          stroke="#22c55e"
          strokeWidth={1.5}
          dot={{ r: 3 }}
          strokeDasharray="4 2"
        />
        <Line
          type="monotone"
          dataKey="problem_solving"
          name="Problem Solving"
          stroke="#f97316"
          strokeWidth={1.5}
          dot={{ r: 3 }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}