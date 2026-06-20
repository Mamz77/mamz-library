import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { formatDate, formatReadingTime } from "@/lib/utils";

export const metadata: Metadata = { title: "ادامه مطالعه | ممز" };

export default async function ReadingHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: inProgress }, { data: sessions }] = await Promise.all([
    supabase
      .from("reading_progress")
      .select("*, book:books(id, title, author, cover_url, slug, total_pages)")
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false }),
    supabase
      .from("reading_sessions")
      .select("*, book:books(title, slug)")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ادامه مطالعه</h1>
        <p className="text-muted-foreground mt-1">کتاب‌هایی که در حال خواندن آنها هستید</p>
      </div>

      {/* In-progress books */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">کتاب‌های ناتمام</h2>
        {(inProgress || []).length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">هنوز هیچ کتابی شروع نکرده‌اید</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(inProgress || []).map((prog) => {
              const book = prog.book as { title: string; author: string; cover_url?: string; slug: string; total_pages: number };
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
                      <p className="font-semibold text-foreground line-clamp-1">{book.title}</p>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${prog.percentage}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          صفحه {prog.current_page.toLocaleString("fa-IR")} از {book.total_pages.toLocaleString("fa-IR")}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(prog.last_read_at)}
                        </div>
                      </div>
                    </div>
                    <ProgressRing percentage={Math.round(prog.percentage)} size={56} strokeWidth={5} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent sessions */}
      {(sessions || []).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">تاریخچه جلسات مطالعه</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">کتاب</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">مدت</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(sessions || []).map((session) => {
                  const book = session.book as { title: string; slug: string } | null;
                  return (
                    <tr key={session.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {book ? (
                          <Link href={`/book/${book.slug}`} className="hover:text-primary transition-colors">
                            {book.title}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {formatReadingTime(session.duration_seconds || 0)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(session.started_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
