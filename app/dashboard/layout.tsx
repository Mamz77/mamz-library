import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <DashboardSidebar profile={profile || { username: "", email: user.email || "" }} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
