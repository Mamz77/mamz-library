import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, User, Tag, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookReadButton } from "@/components/books/BookReadButton";
import { SaveBookButton } from "@/components/books/SaveBookButton";
import { BookGrid } from "@/components/books/BookGrid";
import type { Book } from "@/types";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("title, author, description, cover_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!book) return { title: "کتاب یافت نشد" };

  return {
    title: `${book.title} - ${book.author}`,
    description: book.description?.slice(0, 160),
    openGraph: {
      title: book.title,
      description: book.description?.slice(0, 160),
      images: book.cover_url ? [{ url: book.cover_url }] : [],
      type: "book",
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select(`
      *,
      category:categories(*),
      tags:book_tags(tag:tags(*))
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!book) notFound();

  // Log view event (best effort)
  const { data: { user } } = await supabase.auth.getUser();
  supabase.from("analytics_events").insert({
    book_id: book.id,
    user_id: user?.id || null,
    event_type: "view",
  }).then(() => {});

  // Reading progress
  let progress = null;
  if (user) {
    const { data } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("book_id", book.id)
      .single();
    progress = data;
  }

  // Related books (same category)
  const { data: related } = await supabase
    .from("books")
    .select("*, category:categories(*)")
    .eq("is_published", true)
    .eq("category_id", book.category_id)
    .neq("id", book.id)
    .limit(6);

  const tags = (book.tags || []).map((t: { tag: { id: string; name: string; slug: string } }) => t.tag).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">خانه</Link>
          <span>/</span>
          {book.category && (
            <>
              <Link href={`/categories?cat=${book.category.slug}`} className="hover:text-foreground transition-colors">
                {book.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground line-clamp-1">{book.title}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {/* Cover */}
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-2xl">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-6">
                  <BookOpen className="w-16 h-16 text-primary/30 mb-3" />
                  <p className="text-center text-foreground font-semibold">{book.title}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-2 lg:col-span-3 space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
                {book.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{book.author}</span>
              </div>
            </div>

            {/* Category + Tags */}
            <div className="flex flex-wrap gap-2">
              {book.category && (
                <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  {book.category.name}
                </span>
              )}
              {tags.map((tag: { id: string; name: string }) => (
                <span key={tag.id} className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Description */}
            {book.description && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h2 className="font-semibold text-foreground mb-2">درباره کتاب</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{book.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              {book.total_pages > 0 && (
                <span>{book.total_pages.toLocaleString("fa-IR")} صفحه</span>
              )}
            </div>

            {/* Progress (if reading) */}
            {progress && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm font-medium text-foreground mb-2">پیشرفت مطالعه</p>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  صفحه {progress.current_page.toLocaleString("fa-IR")} از {book.total_pages.toLocaleString("fa-IR")} ({Math.round(progress.percentage)}٪)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <BookReadButton
                bookSlug={book.slug}
                bookId={book.id}
                currentPage={progress?.current_page}
                isLoggedIn={!!user}
              />
              {user && <SaveBookButton bookId={book.id} userId={user.id} />}
            </div>
          </div>
        </div>

        {/* Related books */}
        {(related || []).length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">کتاب‌های مرتبط</h2>
            <BookGrid books={related as Book[]} />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
