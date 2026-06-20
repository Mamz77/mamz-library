import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "ثبت‌نام | کتابخانه ممز",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="ایجاد حساب کاربری"
      subtitle="برای دسترسی به کتابخانه ثبت‌نام کنید"
    >
      <RegisterForm />
    </AuthCard>
  );
}
