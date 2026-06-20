import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { verifyAdminSession } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ورود مدیر | کتابخانه ممز",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const isAdmin = await verifyAdminSession();
  if (isAdmin) redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">پنل مدیریت</h1>
          <p className="text-sm text-muted-foreground mt-1">کتابخانه ممز</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
