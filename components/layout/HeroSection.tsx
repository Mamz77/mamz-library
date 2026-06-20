import Link from "next/link";
import { BookOpen, Users, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 py-20 text-center">
        {/* Logo mark */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          کتابخانه{" "}
          <span className="text-primary">ممز</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          مجموعه‌ای از بهترین کتاب‌های عمومی و آزاد به فارسی و انگلیسی.
          مطالعه کنید، پیشرفت خود را دنبال کنید و دانش بیشتری کسب نمایید.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            شروع مطالعه
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-muted text-foreground px-8 py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors border border-border"
          >
            ثبت‌نام رایگان
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { icon: BookOpen, value: "۵۰۰+", label: "کتاب" },
            { icon: Users, value: "۱۰۰۰+", label: "کاربر" },
            { icon: Star, value: "رایگان", label: "همیشه" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
