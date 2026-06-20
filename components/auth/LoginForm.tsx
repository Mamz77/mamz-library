"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signInWithGoogle } from "@/lib/auth/actions";
import { FormField, SubmitButton, AlertBox } from "./FormField";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Google login */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        type="button"
        className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        {googleLoading ? (
          <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        ورود با گوگل
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-card px-3">یا با ایمیل</span>
        </div>
      </div>

      {message && <AlertBox type={message.type} message={message.text} />}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="رمز عبور خود را وارد کنید"
          autoComplete="current-password"
          required
          dir="ltr"
        />

        <div className="flex justify-end">
          <Link
            href="/auth/reset-password"
            className="text-xs text-primary hover:underline"
          >
            فراموشی رمز عبور؟
          </Link>
        </div>

        <SubmitButton loading={loading}>ورود</SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        حساب ندارید؟{" "}
        <Link href="/auth/register" className="text-primary hover:underline font-medium">
          ثبت‌نام کنید
        </Link>
      </p>
    </div>
  );
}
