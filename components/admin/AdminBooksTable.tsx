"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Edit2, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { togglePublish, deleteBook } from "@/lib/admin/bookActions";
import { AdminEditBookModal } from "./AdminEditBookModal";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { Book, Category } from "@/types";

interface AdminBooksTableProps {
  books: Book[];
  categories: Category[];
}

export function AdminBooksTable({ books, categories }: AdminBooksTableProps) {
  const [items, setItems] = useState(books);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);

  async function handleToggle(book: Book) {
    setLoadingId(book.id);
    const res = await togglePublish(book.id, book.is_published);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setItems((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, is_published: !b.is_published } : b
        )
      );
    }
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا از حذف این کتاب مطمئن هستید؟")) return;
    setLoadingId(id);
    const res = await deleteBook(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setItems((prev) => prev.filter((b) => b.id !== id));
    }
    setLoadingId(null);
  }

  return (
    <>
      {editBook && (
        <AdminEditBookModal
          book={editBook}
          categories={categories}
          onClose={() => setEditBook(null)}
          onSave={(updated) => {
            setItems((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            setEditBook(null);
          }}
        />
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">کتاب</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">نویسنده</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">دسته‌بندی</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">وضعیت</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">صفحات</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    هیچ کتابی ثبت نشده است
                  </td>
                </tr>
              )}
              {items.map((book) => (
                <tr
                  key={book.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    loadingId === book.id && "opacity-50 pointer-events-none"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded bg-muted overflow-hidden shrink-0 relative">
                        {book.cover_url ? (
                          <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground line-clamp-1">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{book.author}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {(book as Book & { category?: { name: string } }).category ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {(book as Book & { category?: { name: string } }).category!.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        book.is_published
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {book.is_published ? "منتشرشده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {book.total_pages.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(book)}
                        title={book.is_published ? "پنهان کردن" : "انتشار"}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {book.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditBook(book)}
                        title="ویرایش"
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        title="حذف"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
