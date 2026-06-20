import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "کتابخانه ممز | Mamz Library",
    template: "%s | کتابخانه ممز",
  },
  description:
    "کتابخانه آنلاین ممز - مجموعه‌ای از کتاب‌های ارزنده و آزاد برای مطالعه آنلاین",
  keywords: ["کتاب", "مطالعه", "کتابخانه آنلاین", "کتاب رایگان", "ممز"],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "کتابخانه ممز",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(224 71% 6%)",
                  color: "hsl(213 31% 91%)",
                  border: "1px solid hsl(216 34% 17%)",
                  fontFamily: "Vazirmatn, Tahoma, sans-serif",
                  direction: "rtl",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
