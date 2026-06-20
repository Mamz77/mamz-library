"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const INVITATION_CODE = process.env.INVITATION_CODE || "3636";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const invitationCode = formData.get("invitationCode") as string;

  if (!email || !password || !username || !confirmPassword || !invitationCode) {
    return { error: "همه فیلدها الزامی است" };
  }
  if (invitationCode !== INVITATION_CODE) {
    return { error: "کد دعوت‌نامه اشتباه است" };
  }
  if (password !== confirmPassword) {
    return { error: "رمز عبور و تکرار آن یکسان نیستند" };
  }
  if (password.length < 8) {
    return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد" };
  }

  // Check username uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return { error: "این نام کاربری قبلاً استفاده شده است" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "این ایمیل قبلاً ثبت‌نام کرده است" };
    }
    return { error: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید" };
  }

  return { success: "ثبت‌نام موفق! لطفاً ایمیل خود را تأیید کنید" };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "ایمیل و رمز عبور الزامی است" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "ایمیل یا رمز عبور اشتباه است" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "لطفاً ابتدا ایمیل خود را تأیید کنید" };
    }
    return { error: "خطا در ورود. لطفاً دوباره تلاش کنید" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: "خطا در ورود با گوگل" };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "ایمیل الزامی است" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm`,
  });

  if (error) {
    return { error: "خطا در ارسال ایمیل بازیابی" };
  }

  return { success: "لینک بازیابی رمز عبور به ایمیل شما ارسال شد" };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "رمز عبور و تکرار آن یکسان نیستند" };
  }
  if (password.length < 8) {
    return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "خطا در بروزرسانی رمز عبور" };
  }

  redirect("/dashboard/profile");
}
