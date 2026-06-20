import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = { title: "پروفایل | ممز" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-foreground">پروفایل</h1>
        <p className="text-muted-foreground mt-1">اطلاعات حساب کاربری خود را مدیریت کنید</p>
      </div>
      <ProfileForm profile={profile} email={user.email || ""} />
    </div>
  );
}
