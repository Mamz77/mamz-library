import Link from "next/link";
import Image from "next/image";
import { BookOpen, Eye } from "lucide-react";
import { cn, getReadingPercentage } from "@/lib/utils";
import type { Book, ReadingProgress } from "@/types";

interface BookCardProps {
  book: Book;
  progress?: ReadingProgress;
  className?: string;
}

export function BookCard({ book, progress, className }: BookCardProps) {
  const percentage = progress
    ? getReadingPercentage(progress.current_page, book.total_pages)
    : 0;

  return (
    <Link href={`/book/${book.slug}`}>
      <div
        className={cn(
          "group relative rounded-xl overflow-hidden bg-card border border-border",
          "book-card-hover cursor-pointer",
          className
        )}
      >
        {/* Cover */}
        <div className="relative aspect-[2/3] bg-muted">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-4">
              <BookOpen className="w-10 h-10 text-primary/50 mb-2" />
              <p className="text-xs text-center text-muted-foreground font-medium line-clamp-3">
                {book.title}
              </p>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Eye className="w-4 h-4" />
              مشاهده
            </div>
          </div>

          {/* Progress bar */}
          {progress && percentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-1">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.author}
          </p>
          {book.category && (
            <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {book.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
