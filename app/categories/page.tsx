import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookGrid } from "@/components/books/BookGrid";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";

export const metadata: Metadata = { title: "دسته‌بندی‌ها | ممز" };

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function CategoriesPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const activeCategory = categories?.find((c) => c.slug === cat);

  let books: Book[] = [];
  if (activeCategory) {
    const { data } = await supabase
      .from("books")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .eq("category_id", activeCategory.id)
      .order("created_at", { ascending: false });
    books = (data as Book[]) || [];
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">دسته‌بندی‌ها</h1>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {(categories || []).map((category) => (
            <Link
              key={category.id}
              href={`/categories?cat=${category.slug}`}
              className={cn(
                "flex items-center justify-center text-center p-4 rounded-xl border transition-all font-medium text-sm",
                cat === category.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Books for selected category */}
        {activeCategory ? (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              {activeCategory.name}
              <span className="text-sm font-normal text-muted-foreground mr-2">
                ({books.length.toLocaleString("fa-IR")} کتاب)
              </span>
            </h2>
            <BookGrid books={books} emptyMessage="کتابی در این دسته‌بندی موجود نیست" />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            یک دسته‌بندی انتخاب کنید
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
