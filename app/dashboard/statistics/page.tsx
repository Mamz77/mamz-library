import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Clock, BookOpen, BookCheck, TrendingUp } from "lucide-react";
import { formatReadingTime } from "@/lib/utils";
import { StatsCharts } from "@/components/dashboard/StatsCharts";

export const metadata: Metadata = { title: "آمار مطالعه | ممز" };

export default async function StatisticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: progress },
    { data: sessions },
    { count: savedCount },
  ] = await Promise.all([
    supabase
      .from("reading_progress")
      .select("percentage, book:books(title)")
      .eq("user_id", user.id),
    supabase
      .from("reading_sessions")
      .select("duration_seconds, started_at, pages_read")
      .eq("user_id", user.id)
      .order("started_at"),
    supabase
      .from("saved_books")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const totalTime = (sessions || []).reduce(
    (s, r) => s + (r.duration_seconds || 0),
    0
  );
  const totalStarted = (progress || []).length;
  const totalFinished = (progress || []).filter((p) => p.percentage >= 95).length;

  // Sessions by day (last 14 days)
  const dailyMap: Record<string, number> = {};
  (sessions || []).forEach((s) => {
    const day = s.started_at?.slice(0, 10);
    if (day) dailyMap[day] = (dailyMap[day] || 0) + Math.round((s.duration_seconds || 0) / 60);
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, minutes]) => ({
      date: new Date(date).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
      minutes,
    }));

  const statCards = [
    {
      label: "کل وقت مطالعه",
      value: formatReadingTime(totalTime),
      icon: Clock,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "کتاب شروع‌شده",
      value: totalStarted.toLocaleString("fa-IR"),
      icon: BookOpen,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "کتاب تمام‌شده",
      value: totalFinished.toLocaleString("fa-IR"),
      icon: BookCheck,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "کتاب‌های ذخیره‌شده",
      value: (savedCount || 0).toLocaleString("fa-IR"),
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">آمار مطالعه</h1>
        <p className="text-muted-foreground mt-1">خلاصه‌ای از فعالیت مطالعه شما</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <StatsCharts dailyData={dailyData} />

      {/* Progress list */}
      {totalStarted > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">پیشرفت کتاب‌ها</h2>
          <div className="space-y-3">
            {(progress || [])
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 10)
              .map((p, i) => {
                const book = p.book as { title: string } | null;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 text-xs text-muted-foreground text-center">
                      {(i + 1).toLocaleString("fa-IR")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate mb-1">
                        {book?.title || "کتاب"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(p.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-left shrink-0">
                          {Math.round(p.percentage)}٪
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
