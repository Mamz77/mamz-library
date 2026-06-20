import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookGrid } from "@/components/books/BookGrid";
import { SearchBar } from "@/components/books/SearchBar";
import type { Book } from "@/types";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `جستجو: ${q} | ممز` : "جستجو | ممز" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const supabase = await createClient();

  let books: Book[] = [];

  if (query) {
    const { data } = await supabase
      .from("books")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(48);
    books = (data as Book[]) || [];

    // Log search event
    supabase.from("analytics_events").insert({
      event_type: "search",
      metadata: { query },
    }).then(() => {});
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-4 text-center">جستجو در کتاب‌ها</h1>
          <SearchBar initialQuery={query} />
        </div>

        {query ? (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {books.length > 0
                ? `${books.length.toLocaleString("fa-IR")} نتیجه برای «${query}»`
                : `نتیجه‌ای برای «${query}» یافت نشد`}
            </p>
            <BookGrid
              books={books}
              emptyMessage={`نتیجه‌ای برای «${query}» یافت نشد. کلمه دیگری امتحان کنید.`}
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">عنوان کتاب یا نام نویسنده را جستجو کنید</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
