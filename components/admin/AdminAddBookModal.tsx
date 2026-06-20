"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createBook } from "@/lib/admin/bookActions";
import { BookFormFields } from "./BookFormFields";
import { SubmitButton } from "@/components/auth/FormField";
import toast from "react-hot-toast";
import type { Category, Tag } from "@/types";

interface AdminAddBookModalProps {
  categories: Category[];
  tags?: Tag[];
}

export function AdminAddBookModal({ categories, tags = [] }: AdminAddBookModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createBook(formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "کتاب اضافه شد");
      setOpen(false);
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        افزودن کتاب
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-bold text-foreground">افزودن کتاب جدید</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <BookFormFields categories={categories} tags={tags} />
              <div className="mt-6">
                <SubmitButton loading={loading}>ثبت کتاب</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
