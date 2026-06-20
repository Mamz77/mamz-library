"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin";
import { slugify } from "@/lib/utils";

async function guardAdmin() {
  const ok = await verifyAdminSession();
  if (!ok) throw new Error("دسترسی غیرمجاز");
}

export async function createCategory(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "نام دسته‌بندی الزامی است" };
  const slug = slugify(name);
  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) return { error: "این دسته‌بندی قبلاً وجود دارد" };
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: "دسته‌بندی اضافه شد" };
}

export async function deleteCategory(id: string) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: "خطا در حذف دسته‌بندی" };
  revalidatePath("/admin/categories");
  return { success: "دسته‌بندی حذف شد" };
}

export async function createTag(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "نام برچسب الزامی است" };
  const slug = slugify(name);
  const { error } = await supabase.from("tags").insert({ name, slug });
  if (error) return { error: "این برچسب قبلاً وجود دارد" };
  revalidatePath("/admin/categories");
  return { success: "برچسب اضافه شد" };
}

export async function deleteTag(id: string) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) return { error: "خطا در حذف برچسب" };
  revalidatePath("/admin/categories");
  return { success: "برچسب حذف شد" };
}
