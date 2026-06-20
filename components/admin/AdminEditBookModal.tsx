"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateBook } from "@/lib/admin/bookActions";
import { BookFormFields } from "./BookFormFields";
import { SubmitButton } from "@/components/auth/FormField";
import toast from "react-hot-toast";
import type { Book, Category, Tag } from "@/types";

interface AdminEditBookModalProps {
  book: Book;
  categories: Category[];
  tags?: Tag[];
  onClose: () => void;
  onSave: (updated: Book) => void;
}

export function AdminEditBookModal({ book, categories, tags = [], onClose, onSave }: AdminEditBookModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateBook(book.id, formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "کتاب بروزرسانی شد");
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;
      const is_published = formData.get("is_published") === "true";
      onSave({ ...book, title, author, is_published });
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-foreground">ویرایش کتاب</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <BookFormFields
            categories={categories}
            tags={tags}
            defaultValues={{
              ...book,
              tag_ids: [],
            }}
          />
          <div className="mt-6">
            <SubmitButton loading={loading}>ذخیره تغییرات</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
