import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminCategoriesManager } from "@/components/admin/AdminCategoriesManager";

export const metadata: Metadata = {
  title: "دسته‌بندی‌ها | پنل مدیریت ممز",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">دسته‌بندی‌ها و برچسب‌ها</h1>
        <p className="text-muted-foreground mt-1">مدیریت دسته‌بندی‌ها و برچسب‌های کتاب</p>
      </div>
      <AdminCategoriesManager categories={categories || []} tags={tags || []} />
    </div>
  );
}
