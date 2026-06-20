import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export const metadata: Metadata = {
  title: "مدیریت کاربران | پنل مدیریت ممز",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مدیریت کاربران</h1>
        <p className="text-muted-foreground mt-1">{(users || []).length} کاربر ثبت‌نام‌کرده</p>
      </div>
      <AdminUsersTable users={users || []} />
    </div>
  );
}
