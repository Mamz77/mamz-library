"use client";

import { useState } from "react";
import { adminLogin } from "@/lib/auth/admin";
import { FormField, SubmitButton, AlertBox } from "@/components/auth/FormField";

export function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {error && <AlertBox type="error" message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="نام کاربری"
          name="username"
          type="text"
          placeholder="نام کاربری مدیر"
          autoComplete="username"
          required
          dir="ltr"
        />
        <FormField
          label="رمز عبور"
          name="password"
          type="password"
          placeholder="رمز عبور"
          autoComplete="current-password"
          required
          dir="ltr"
        />
        <SubmitButton loading={loading}>ورود به پنل مدیریت</SubmitButton>
      </form>
    </div>
  );
}
