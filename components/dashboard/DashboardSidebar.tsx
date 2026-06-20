"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, BookOpen, Clock, Library, BarChart3, LogOut, BookMarked,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/profile", label: "پروفایل", icon: User },
  { href: "/dashboard/reading-history", label: "ادامه مطالعه", icon: BookOpen },
  { href: "/dashboard/my-library", label: "کتابخانه من", icon: Library },
  { href: "/dashboard/statistics", label: "آمار مطالعه", icon: BarChart3 },
];

interface DashboardSidebarProps {
  profile: { username: string; email: string; avatar_url?: string | null };
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-card border-l border-border flex flex-col shrink-0 hidden md:flex">
      {/* User info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {(profile.username || profile.email || "؟")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile.username || "کاربر"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <BookMarked className="w-4 h-4" />
          بازگشت به سایت
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </form>
      </div>
    </aside>
  );
}
