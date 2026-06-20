import Link from "next/link";
import { BookOpen, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-2">۴۰۴</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          صفحه مورد نظر یافت نشد
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          صفحه‌ای که دنبالش می‌گردید وجود ندارد یا منتقل شده است.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            صفحه اصلی
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 bg-muted text-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-muted/80 transition-colors border border-border"
          >
            <Search className="w-4 h-4" />
            جستجوی کتاب
          </Link>
        </div>
      </div>
    </div>
  );
}
