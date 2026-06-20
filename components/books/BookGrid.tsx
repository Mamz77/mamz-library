import { BookCard } from "./BookCard";
import type { Book, ReadingProgress } from "@/types";

interface BookGridProps {
  books: Book[];
  progressMap?: Record<string, ReadingProgress>;
  emptyMessage?: string;
}

export function BookGrid({
  books,
  progressMap,
  emptyMessage = "هیچ کتابی یافت نشد",
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">📚</span>
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          progress={progressMap?.[book.id]}
        />
      ))}
    </div>
  );
}
