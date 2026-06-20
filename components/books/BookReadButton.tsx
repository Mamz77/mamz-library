"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export function BookReadButton({
  bookSlug,
  bookId,
  currentPage,
  isLoggedIn,
}: {
  bookSlug: string;
  bookId: string;
  currentPage?: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    router.push(`/book/${bookSlug}/read`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex-1 sm:flex-initial"
    >
      <BookOpen className="w-5 h-5" />
      {currentPage && currentPage > 1 ? "ادامه مطالعه" : "شروع مطالعه"}
    </button>
  );
}

export function SaveBookButton({
  bookId,
  userId,
}: {
  bookId: string;
  userId: string;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async () => {
    setLoading(true);
    if (saved) {
      const { error } = await supabase
        .from("saved_books")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId);
      if (!error) {
        setSaved(false);
        toast.success("از کتابخانه حذف شد");
      }
    } else {
      const { error } = await supabase
        .from("saved_books")
        .insert({ user_id: userId, book_id: bookId });
      if (!error) {
        setSaved(true);
        toast.success("به کتابخانه اضافه شد");
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center justify-center gap-2 border border-border bg-card text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted transition-colors disabled:opacity-50"
    >
      {saved ? (
        <BookmarkCheck className="w-5 h-5 text-primary" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
      {saved ? "ذخیره‌شده" : "ذخیره در کتابخانه"}
    </button>
  );
}
