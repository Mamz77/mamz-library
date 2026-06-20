import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "بازیابی رمز عبور | کتابخانه ممز",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="بازیابی رمز عبور"
      subtitle="ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
