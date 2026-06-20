import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PDFReader } from "@/components/reader/PDFReader";
import type { Metadata } from "next";

interface ReadPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ReadPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("title, author")
    .eq("slug", slug)
    .single();
  return {
    title: book ? `مطالعه: ${book.title}` : "کتاب‌خوان",
    robots: { index: false, follow: false },
  };
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!book) notFound();

  // Get existing progress
  const { data: progress } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", book.id)
    .single();

  // Log read_start event
  await supabase.from("analytics_events").insert({
    user_id: user.id,
    book_id: book.id,
    event_type: "read_start",
  });

  return (
    <PDFReader
      bookId={book.id}
      bookTitle={book.title}
      pdfUrl={book.pdf_url}
      totalPages={book.total_pages}
      initialPage={progress?.current_page || 1}
      userId={user.id}
      bookSlug={book.slug}
    />
  );
}
