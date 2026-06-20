"use client";

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface ChartData {
  date: string;
  views: number;
  reads: number;
  registrations: number;
}

interface TopViewed {
  title: string;
  author: string;
  count: number;
}

const TOOLTIP_STYLE = {
  background: "hsl(224 71% 6%)",
  border: "1px solid hsl(216 34% 17%)",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "Vazirmatn, Tahoma, sans-serif",
};

export function AdminAnalyticsCharts({
  chartData,
  topViewed,
}: {
  chartData: ChartData[];
  topViewed: TopViewed[];
}) {
  const formatted = chartData.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-6">
      {/* Line chart: 30-day trend */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-1">روند ۳۰ روزه</h3>
        <p className="text-xs text-muted-foreground mb-5">بازدید، مطالعه و ثبت‌نام روزانه</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215 16% 57%)" }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215 16% 57%)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "Vazirmatn, Tahoma, sans-serif" }} />
            <Line type="monotone" dataKey="views" name="بازدید" stroke="hsl(270 80% 65%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="reads" name="مطالعه" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="registrations" name="ثبت‌نام" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top viewed books bar chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-1">پربازدیدترین کتاب‌ها</h3>
        <p className="text-xs text-muted-foreground mb-5">۱۰ کتاب با بیشترین بازدید</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={topViewed}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 16% 57%)" }} />
            <YAxis
              type="category"
              dataKey="title"
              width={120}
              tick={{ fontSize: 10, fill: "hsl(215 16% 57%)" }}
              tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + "…" : v}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, "بازدید"]} />
            <Bar dataKey="count" name="بازدید" fill="hsl(270 80% 65%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
