import Image from "next/image";
import { BookOpen } from "lucide-react";

interface TopBook {
  count: number;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    slug: string;
  };
}

export function AdminTopBooks({ books }: { books: TopBook[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <h3 className="font-semibold text-foreground mb-1">پرخواننده‌ترین کتاب‌ها</h3>
      <p className="text-xs text-muted-foreground mb-4">بر اساس تعداد جلسات مطالعه</p>
      <div className="space-y-3">
        {books.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">داده‌ای موجود نیست</p>
        )}
        {books.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-5 text-center font-bold">
              {(i + 1).toLocaleString("fa-IR")}
            </span>
            <div className="w-8 h-10 rounded bg-muted overflow-hidden shrink-0 relative">
              {item.book.cover_url ? (
                <Image src={item.book.cover_url} alt={item.book.title} fill className="object-cover" sizes="32px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.book.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.book.author}</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
              {item.count.toLocaleString("fa-IR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
