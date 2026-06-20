import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Bookmark } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Book } from "@/types";

export const metadata: Metadata = { title: "کتابخانه من | ممز" };

export default async function MyLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: saved } = await supabase
    .from("saved_books")
    .select("*, book:books(id, title, author, cover_url, slug, category:categories(name))")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">کتابخانه من</h1>
        <p className="text-muted-foreground mt-1">
          {(saved || []).length.toLocaleString("fa-IR")} کتاب ذخیره‌شده
        </p>
      </div>

      {(saved || []).length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">کتابخانه‌تان خالی است</p>
          <p className="text-muted-foreground text-sm mb-6">
            از صفحه هر کتاب، روی «ذخیره» بزنید تا اینجا نمایش داده شود
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            کاوش در کتاب‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(saved || []).map((item) => {
            const book = item.book as Book & {
              category?: { name: string };
            };
            if (!book) return null;
            return (
              <Link key={item.id} href={`/book/${book.slug}`}>
                <div className="group bg-card border border-border rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[2/3] bg-muted">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {book.author}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(item.saved_at)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
