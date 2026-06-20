"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormField, SubmitButton, AlertBox } from "@/components/auth/FormField";
import toast from "react-hot-toast";

interface ProfileFormProps {
  profile: { username?: string; bio?: string } | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const supabase = createClient();

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    const bio = fd.get("bio") as string;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ username, bio })
      .eq("id", user.id);
    if (error) setMsg({ type: "error", text: "خطا در بروزرسانی پروفایل" });
    else setMsg({ type: "success", text: "پروفایل با موفقیت بروزرسانی شد" });
    setLoading(false);
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg(null);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;
    if (password !== confirm) {
      setPwMsg({ type: "error", text: "رمز عبور و تکرار آن یکسان نیستند" });
      setPwLoading(false);
      return;
    }
    if (password.length < 8) {
      setPwMsg({ type: "error", text: "رمز عبور حداقل ۸ کاراکتر باشد" });
      setPwLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setPwMsg({ type: "error", text: "خطا در تغییر رمز عبور" });
    else {
      setPwMsg({ type: "success", text: "رمز عبور تغییر کرد" });
      toast.success("رمز عبور با موفقیت تغییر کرد");
    }
    setPwLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">اطلاعات پروفایل</h2>
        {msg && <AlertBox type={msg.type} message={msg.text} />}
        <form onSubmit={handleProfile} className="space-y-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">ایمیل</label>
            <input
              type="email"
              value={email}
              disabled
              dir="ltr"
              className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
          <FormField
            label="نام کاربری"
            name="username"
            type="text"
            defaultValue={profile?.username || ""}
            placeholder="نام کاربری"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">بیوگرافی</label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={profile?.bio || ""}
              placeholder="درباره خود بنویسید..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <SubmitButton loading={loading}>ذخیره تغییرات</SubmitButton>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4">تغییر رمز عبور</h2>
        {pwMsg && <AlertBox type={pwMsg.type} message={pwMsg.text} />}
        <form onSubmit={handlePassword} className="space-y-4 mt-3">
          <FormField
            label="رمز عبور جدید"
            name="password"
            type="password"
            placeholder="حداقل ۸ کاراکتر"
            dir="ltr"
            required
          />
          <FormField
            label="تکرار رمز عبور"
            name="confirm"
            type="password"
            placeholder="رمز عبور را تکرار کنید"
            dir="ltr"
            required
          />
          <SubmitButton loading={pwLoading}>تغییر رمز عبور</SubmitButton>
        </form>
      </div>
    </div>
  );
}
