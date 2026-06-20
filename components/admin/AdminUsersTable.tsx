"use client";

import { useState } from "react";
import { UserCheck, UserX, Trash2, Search } from "lucide-react";
import { toggleUserActive, deleteUser } from "@/lib/admin/userActions";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export function AdminUsersTable({ users }: { users: UserProfile[] }) {
  const [items, setItems] = useState(users);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = items.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggle(user: UserProfile) {
    setLoadingId(user.id);
    const res = await toggleUserActive(user.id, user.is_active);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setItems((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
    }
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟ این عمل برگشت‌ناپذیر است."))
      return;
    setLoadingId(id);
    const res = await deleteUser(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setItems((prev) => prev.filter((u) => u.id !== id));
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="جستجو در کاربران..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">کاربر</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">ایمیل</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">وضعیت</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">تاریخ ثبت‌نام</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    کاربری یافت نشد
                  </td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    loadingId === user.id && "opacity-50 pointer-events-none"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {(user.username || user.email || "؟")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.username || "—"}</p>
                        {user.is_admin && (
                          <span className="text-xs text-primary">مدیر</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell" dir="ltr">
                    {user.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        user.is_active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {user.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                    {user.created_at ? formatDate(user.created_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(user)}
                        title={user.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {user.is_active ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                      {!user.is_admin && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="حذف کاربر"
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
