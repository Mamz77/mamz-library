"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth/actions";
import { FormField, SubmitButton, AlertBox } from "./FormField";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {message && <AlertBox type={message.type} message={message.text} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="نام کاربری"
          name="username"
          type="text"
          placeholder="نام کاربری منحصربه‌فرد"
          autoComplete="username"
          required
        />
        <FormField
          label="ایمیل"
          name="email"
          type="email"
          placeholder="example@email.com"
          autoComplete="email"
          required
          dir="ltr"
        />
        <FormField
          label="رمز عبور"
          name="password"
          type="password"
          placeholder="حداقل ۸ کاراکتر"
          autoComplete="new-password"
          required
          dir="ltr"
        />
        <FormField
          label="تکرار رمز عبور"
          name="confirmPassword"
          type="password"
          placeholder="رمز عبور را دوباره وارد کنید"
          autoComplete="new-password"
          required
          dir="ltr"
        />

        {/* Invitation code */}
        <div className="border border-border/50 rounded-xl p-4 bg-primary/5">
          <FormField
            label="کد دعوت‌نامه"
            name="invitationCode"
            type="text"
            placeholder="کد دعوت را وارد کنید"
            required
            maxLength={10}
          />
          <p className="text-xs text-muted-foreground mt-2">
            برای ثبت‌نام به کد دعوت‌نامه نیاز دارید
          </p>
        </div>

        <SubmitButton loading={loading}>ثبت‌نام</SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        حساب دارید؟{" "}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          وارد شوید
        </Link>
      </p>
    </div>
  );
}
