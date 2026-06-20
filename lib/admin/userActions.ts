"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin";

async function guardAdmin() {
  const ok = await verifyAdminSession();
  if (!ok) throw new Error("دسترسی غیرمجاز");
}

export async function toggleUserActive(userId: string, currentStatus: boolean) {
  await guardAdmin();
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !currentStatus })
    .eq("id", userId);
  if (error) return { error: "خطا در تغییر وضعیت کاربر" };
  revalidatePath("/admin/users");
  return { success: !currentStatus ? "کاربر فعال شد" : "کاربر غیرفعال شد" };
}

export async function deleteUser(userId: string) {
  await guardAdmin();
  const supabase = await createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { error: "خطا در حذف کاربر" };
  revalidatePath("/admin/users");
  return { success: "کاربر حذف شد" };
}
