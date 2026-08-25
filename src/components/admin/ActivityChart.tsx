"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ActivityPoint {
  day: string;
  clicks: number;
  leads: number;
}

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "var(--chart-2)",
  },
  leads: {
    label: "Leads",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ActivityChart({
  data,
  showLegend = true,
}: {
  data: ActivityPoint[];
  showLegend?: boolean;
}) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart accessibilityLayer data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={(value: string) =>
            new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        {showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        <Area
          dataKey="clicks"
          type="monotone"
          fill="var(--color-clicks)"
          fillOpacity={0.15}
          stroke="var(--color-clicks)"
          strokeWidth={2}
        />
        <Area
          dataKey="leads"
          type="monotone"
          fill="var(--color-leads)"
          fillOpacity={0.15}
          stroke="var(--color-leads)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
