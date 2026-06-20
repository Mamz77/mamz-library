import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Library, BarChart3, ChevronLeft } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { formatDate, formatReadingTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "داشبورد | ممز" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: inProgress },
    { data: savedBooks },
    { data: sessions },
  ] = await Promise.all([
    supabase
      .from("reading_progress")
      .select("*, book:books(id, title, author, cover_url, slug, total_pages)")
      .eq("user_id", user.id)
      .gt("percentage", 0)
      .lt("percentage", 100)
      .order("last_read_at", { ascending: false })
      .limit(4),
    supabase
      .from("saved_books")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("reading_sessions")
      .select("duration_seconds")
      .eq("user_id", user.id),
  ]);

  const totalTime = (sessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

  const quickStats = [
    { label: "در حال مطالعه", value: (inProgress || []).length, icon: BookOpen, href: "/dashboard/reading-history" },
    { label: "کتاب‌های ذخیره‌شده", value: (savedBooks as unknown as { count: number } | null)?.count || 0, icon: Library, href: "/dashboard/my-library" },
    { label: "وقت مطالعه", value: formatReadingTime(totalTime), icon: Clock, href: "/dashboard/statistics" },
    { label: "آمار", value: "مشاهده", icon: BarChart3, href: "/dashboard/statistics" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">داشبورد من</h1>
        <p className="text-muted-foreground mt-1">خوش آمدید!</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
              <stat.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Continue reading */}
      {(inProgress || []).length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">ادامه مطالعه</h2>
            <Link href="/dashboard/reading-history" className="text-sm text-primary hover:underline flex items-center gap-1">
              همه <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(inProgress || []).map((prog) => {
              const book = prog.book as { id: string; title: string; author: string; cover_url?: string; slug: string; total_pages: number };
              if (!book) return null;
              return (
                <Link key={prog.id} href={`/book/${book.slug}/read`}>
                  <div className="bg-card border border-border rounded-xl p-4 flex gap-4 hover:border-primary/50 transition-colors group">
                    <div className="relative w-12 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      {book.cover_url ? (
                        <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground line-clamp-1 text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                      <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${prog.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(prog.percentage)}٪ خوانده شده
                      </p>
                    </div>
                    <ProgressRing percentage={Math.round(prog.percentage)} size={52} strokeWidth={4} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {(inProgress || []).length === 0 && (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">هنوز کتابی نخوانده‌اید</p>
          <p className="text-muted-foreground text-sm mb-4">از کتابخانه انتخاب کنید و مطالعه را شروع کنید</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            کاوش در کتاب‌ها
          </Link>
        </div>
      )}
    </div>
  );
}
