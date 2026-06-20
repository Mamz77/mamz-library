import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";

export const metadata: Metadata = {
  title: "آنالیتیکس | پنل مدیریت ممز",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, created_at, book_id")
    .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
    .order("created_at");

  const { data: viewEvents } = await supabase
    .from("analytics_events")
    .select("book_id, books(title, author)")
    .eq("event_type", "view")
    .not("book_id", "is", null)
    .limit(200);

  const viewCounts: Record<string, { count: number; title: string; author: string }> = {};
(viewEvents || []).forEach((e: {
  book_id: string | null;
  books: { title: string; author: string }[] | null;
}) => {
  if (!e.book_id || !e.books?.length) return;

  const book = e.books[0];

  if (!viewCounts[e.book_id]) {
    viewCounts[e.book_id] = {
      count: 0,
      title: book?.title || "",
      author: book?.author || ""
    };
  }

  viewCounts[e.book_id].count++;
});
  const topViewed = Object.values(viewCounts).sort((a, b) => b.count - a.count).slice(0, 10);

  const dailyData: Record<string, { date: string; views: number; reads: number; registrations: number }> = {};
  (events || []).forEach((e) => {
    const date = e.created_at.slice(0, 10);
    if (!dailyData[date]) dailyData[date] = { date, views: 0, reads: 0, registrations: 0 };
    if (e.event_type === "view") dailyData[date].views++;
    if (e.event_type === "read_start") dailyData[date].reads++;
    if (e.event_type === "register") dailyData[date].registrations++;
  });
  const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">آنالیتیکس</h1>
        <p className="text-muted-foreground mt-1">گزارش ۳۰ روز گذشته</p>
      </div>
      <AdminAnalyticsCharts chartData={chartData} topViewed={topViewed} />
    </div>
  );
}
