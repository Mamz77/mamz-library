import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "ورود | کتابخانه ممز",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="ورود به حساب"
      subtitle="به کتابخانه ممز خوش آمدید"
    >
      <LoginForm />
    </AuthCard>
  );
}
