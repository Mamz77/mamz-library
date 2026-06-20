"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyData {
  date: string;
  minutes: number;
}

const TOOLTIP_STYLE = {
  background: "hsl(224 71% 6%)",
  border: "1px solid hsl(216 34% 17%)",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "Vazirmatn, Tahoma, sans-serif",
};

export function StatsCharts({ dailyData }: { dailyData: DailyData[] }) {
  if (dailyData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-muted-foreground text-sm">
          هنوز داده‌ای برای نمایش نمودار وجود ندارد
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="font-semibold text-foreground mb-1">زمان مطالعه روزانه</h2>
      <p className="text-xs text-muted-foreground mb-5">
        ۱۴ روز گذشته (دقیقه)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={dailyData}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(216 34% 17%)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(215 16% 57%)" }}
          />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 57%)" }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v} دقیقه`, "مطالعه"]}
          />
          <Bar
            dataKey="minutes"
            name="دقیقه"
            fill="hsl(270 80% 65%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
