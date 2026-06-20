import Link from "next/link";
import { BookOpen, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">کتابخانه ممز</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              مجموعه‌ای از کتاب‌های ارزنده و آزاد برای مطالعه آنلاین رایگان
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">دسترسی سریع</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "خانه" },
                { href: "/categories", label: "دسته‌بندی‌ها" },
                { href: "/search", label: "جستجو" },
                { href: "/dashboard", label: "داشبورد من" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">منابع</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.gutenberg.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Project Gutenberg
                </a>
              </li>
              <li>
                <a
                  href="https://archive.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Internet Archive
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} کتابخانه ممز. همه حقوق محفوظ است.
          </p>
          <p className="text-xs text-muted-foreground">
            ساخته‌شده با ❤️ برای دوستداران کتاب
          </p>
        </div>
      </div>
    </footer>
  );
}
