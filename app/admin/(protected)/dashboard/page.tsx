import type { Metadata } from "next";
import { Users, BookOpen, Clock, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminActivityChart } from "@/components/admin/AdminActivityChart";
import { AdminTopBooks } from "@/components/admin/AdminTopBooks";

export const metadata: Metadata = {
  title: "داشبورد مدیریت | ممز",
  robots: { index: false, follow: false },
};

async function getDashboardStats() {
  const supabase = await createClient();
  const [
    { count: totalUsers },
    { count: totalBooks },
    { count: totalSessions },
    { count: activeToday },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("reading_sessions").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
  ]);

  const { data: topBooksRaw } = await supabase
    .from("analytics_events")
    .select("book_id, books(id, title, author, cover_url, slug)")
    .eq("event_type", "read_start")
    .not("book_id", "is", null)
    .limit(100);

  const bookCounts: Record<string, { count: number; book: unknown }> = {};
  (topBooksRaw || []).forEach((e: { book_id: string | null; books: unknown }) => {
    if (!e.book_id || !e.books) return;
    if (!bookCounts[e.book_id]) bookCounts[e.book_id] = { count: 0, book: e.books };
    bookCounts[e.book_id].count++;
  });
  const topBooks = Object.values(bookCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  const { data: dailyEvents } = await supabase
    .from("analytics_events")
    .select("created_at, event_type")
    .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
    .order("created_at");

  const activityByDay: Record<string, { sessions: number; registrations: number }> = {};
  (dailyEvents || []).forEach((e) => {
    const day = e.created_at.slice(0, 10);
    if (!activityByDay[day]) activityByDay[day] = { sessions: 0, registrations: 0 };
    if (e.event_type === "read_start") activityByDay[day].sessions++;
    if (e.event_type === "register") activityByDay[day].registrations++;
  });

  return {
    totalUsers: totalUsers || 0,
    totalBooks: totalBooks || 0,
    totalSessions: totalSessions || 0,
    activeToday: activeToday || 0,
    topBooks,
    activityData: Object.entries(activityByDay).map(([date, v]) => ({ date, ...v })),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">داشبورد مدیریت</h1>
        <p className="text-muted-foreground mt-1">خلاصه وضعیت کتابخانه ممز</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatsCard title="کل کاربران" value={stats.totalUsers} icon={Users} subtitle="کاربران ثبت‌نام‌کرده" />
        <AdminStatsCard title="کل کتاب‌ها" value={stats.totalBooks} icon={BookOpen} subtitle="کتاب‌های منتشرشده" />
        <AdminStatsCard title="جلسات مطالعه" value={stats.totalSessions} icon={Clock} subtitle="مجموع جلسات" />
        <AdminStatsCard title="فعال امروز" value={stats.activeToday} icon={TrendingUp} subtitle="رویدادهای ۲۴ ساعت گذشته" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AdminActivityChart data={stats.activityData} />
        </div>
        <div>
          <AdminTopBooks books={stats.topBooks} />
        </div>
      </div>
    </div>
  );
}
