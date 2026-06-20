# 🚀 راهنمای کامل استقرار Mamz Library

## پیش‌نیازها
- Node.js 20+
- حساب Supabase (رایگان)
- حساب Vercel (رایگان)

---

## مرحله ۱ — راه‌اندازی Supabase

1. به supabase.com بروید → New Project
2. در SQL Editor، محتوای `supabase/migrations/001_initial_schema.sql` را اجرا کنید
3. Authentication → Providers → Google را فعال کنید
4. Redirect URL: `https://your-domain.vercel.app/api/auth/callback`
5. از Settings → API کلیدها را کپی کنید

---

## مرحله ۲ — اجرای محلی

```bash
cd mamz-library
npm install
cp .env.example .env.local
# مقادیر .env.local را پر کنید
npm run dev
```

---

## مرحله ۳ — استقرار روی Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

یا: repo را به GitHub push کنید و از vercel.com ایمپورت کنید.

---

## متغیرهای محیطی Vercel

| متغیر | توضیح |
|-------|-------|
| NEXT_PUBLIC_SUPABASE_URL | از Supabase Settings |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | از Supabase Settings |
| SUPABASE_SERVICE_ROLE_KEY | از Supabase Settings |
| NEXT_PUBLIC_APP_URL | آدرس Vercel شما |
| ADMIN_USERNAME | promamzed |
| ADMIN_PASSWORD | prommazed |
| ADMIN_SECRET_KEY | رشته تصادفی ۳۲+ کاراکتر |
| INVITATION_CODE | 3636 |

---

## اطلاعات ورود

- ورود ادمین: /admin/login  |  کاربری: promamzed  |  رمز: prommazed
- کد دعوت ثبت‌نام: 3636
