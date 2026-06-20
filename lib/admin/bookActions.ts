"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin";
import { slugify } from "@/lib/utils";

async function guardAdmin() {
  const ok = await verifyAdminSession();
  if (!ok) throw new Error("دسترسی غیرمجاز");
}

export async function createBook(formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const description = formData.get("description") as string;
  const cover_url = formData.get("cover_url") as string;
  const pdf_url = formData.get("pdf_url") as string;
  const total_pages = parseInt(formData.get("total_pages") as string) || 0;
  const category_id = formData.get("category_id") as string;
  const is_published = formData.get("is_published") === "true";
  const tagIds = formData.getAll("tag_ids") as string[];

  if (!title || !author || !pdf_url) {
    return { error: "عنوان، نویسنده و لینک PDF الزامی است" };
  }

  const slug = slugify(title) + "-" + Date.now().toString(36);

  const { data: book, error } = await supabase
    .from("books")
    .insert({
      title,
      slug,
      author,
      description,
      cover_url: cover_url || null,
      pdf_url,
      total_pages,
      category_id: category_id || null,
      is_published,
    })
    .select()
    .single();

  if (error) return { error: "خطا در ثبت کتاب: " + error.message };

  if (tagIds.length > 0 && book) {
    await supabase.from("book_tags").insert(
      tagIds.map((tag_id) => ({ book_id: book.id, tag_id }))
    );
  }

  revalidatePath("/admin/books");
  revalidatePath("/");
  return { success: "کتاب با موفقیت اضافه شد" };
}

export async function updateBook(id: string, formData: FormData) {
  await guardAdmin();
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const description = formData.get("description") as string;
  const cover_url = formData.get("cover_url") as string;
  const pdf_url = formData.get("pdf_url") as string;
  const total_pages = parseInt(formData.get("total_pages") as string) || 0;
  const category_id = formData.get("category_id") as string;
  const is_published = formData.get("is_published") === "true";
  const tagIds = formData.getAll("tag_ids") as string[];

  const { error } = await supabase
    .from("books")
    .update({
      title,
      author,
      description,
      cover_url: cover_url || null,
      pdf_url,
      total_pages,
      category_id: category_id || null,
      is_published,
    })
    .eq("id", id);

  if (error) return { error: "خطا در بروزرسانی کتاب" };

  // Update tags
  await supabase.from("book_tags").delete().eq("book_id", id);
  if (tagIds.length > 0) {
    await supabase.from("book_tags").insert(
      tagIds.map((tag_id) => ({ book_id: id, tag_id }))
    );
  }

  revalidatePath("/admin/books");
  revalidatePath("/");
  return { success: "کتاب با موفقیت بروزرسانی شد" };
}

export async function deleteBook(id: string) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { error: "خطا در حذف کتاب" };
  revalidatePath("/admin/books");
  revalidatePath("/");
  return { success: "کتاب حذف شد" };
}

export async function togglePublish(id: string, current: boolean) {
  await guardAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({ is_published: !current })
    .eq("id", id);
  if (error) return { error: "خطا در تغییر وضعیت انتشار" };
  revalidatePath("/admin/books");
  revalidatePath("/");
  return { success: !current ? "کتاب منتشر شد" : "کتاب از انتشار خارج شد" };
}
