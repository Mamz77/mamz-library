"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ActivityData {
  date: string;
  sessions: number;
  registrations: number;
}

export function AdminActivityChart({ data }: { data: ActivityData[] }) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-1">فعالیت ۷ روز گذشته</h3>
      <p className="text-xs text-muted-foreground mb-5">جلسات مطالعه و ثبت‌نام‌های جدید</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(270 80% 65%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(270 80% 65%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215 16% 57%)" }} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(215 16% 57%)" }} />
          <Tooltip
            contentStyle={{
              background: "hsl(224 71% 6%)",
              border: "1px solid hsl(216 34% 17%)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "Vazirmatn, Tahoma, sans-serif",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", fontFamily: "Vazirmatn, Tahoma, sans-serif" }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="جلسات مطالعه"
            stroke="hsl(270 80% 65%)"
            fill="url(#colorSessions)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="registrations"
            name="ثبت‌نام جدید"
            stroke="hsl(142 71% 45%)"
            fill="url(#colorReg)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
