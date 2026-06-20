import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookGrid } from "@/components/books/BookGrid";
import { HeroSection } from "@/components/layout/HeroSection";
import { CategoryFilter } from "@/components/books/CategoryFilter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "خانه | کتابخانه ممز",
  description: "کتاب‌های ارزنده برای مطالعه آنلاین رایگان",
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredBooks } = await supabase
    .from("books")
    .select("*, category:categories(*), tags:book_tags(tag:tags(*))")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              کتاب‌های جدید
            </h2>
            <p className="text-muted-foreground">
              آخرین کتاب‌های اضافه‌شده به کتابخانه
            </p>
          </div>
          <Suspense fallback={<BookGridSkeleton />}>
            <CategoryFilter categories={categories || []} />
            <BookGrid books={featuredBooks || []} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton aspect-[2/3] rounded-lg" />
      ))}
    </div>
  );
}
