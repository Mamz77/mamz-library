"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { FormField, SubmitButton, AlertBox } from "./FormField";

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">✉️</span>
        </div>
        <AlertBox type="success" message={message?.text || ""} />
        <p className="text-sm text-muted-foreground">
          صندوق ورودی ایمیل خود را بررسی کنید
        </p>
        <Link href="/auth/login" className="block text-sm text-primary hover:underline">
          بازگشت به ورود
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {message && <AlertBox type={message.type} message={message.text} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="ایمیل"
          name="email"
          type="email"
          placeholder="example@email.com"
          required
          dir="ltr"
        />
        <SubmitButton loading={loading}>ارسال لینک بازیابی</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary hover:underline">
          بازگشت به ورود
        </Link>
      </p>
    </div>
  );
}
