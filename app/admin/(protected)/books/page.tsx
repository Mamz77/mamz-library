import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminBooksTable } from "@/components/admin/AdminBooksTable";
import { AdminAddBookModal } from "@/components/admin/AdminAddBookModal";

export const metadata: Metadata = {
  title: "مدیریت کتاب‌ها | پنل مدیریت ممز",
  robots: { index: false, follow: false },
};

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const [{ data: books }, { data: categories }, { data: tags }] = await Promise.all([
    supabase.from("books").select("*, category:categories(id, name)").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت کتاب‌ها</h1>
          <p className="text-muted-foreground mt-1">{(books || []).length} کتاب در سیستم</p>
        </div>
        <AdminAddBookModal categories={categories || []} tags={tags || []} />
      </div>
      <AdminBooksTable books={books || []} categories={categories || []} />
    </div>
  );
}
