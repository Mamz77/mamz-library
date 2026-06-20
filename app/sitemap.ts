import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("slug, updated_at")
    .eq("is_published", true);

  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  const bookPages = (books || []).map((book) => ({
    url: `${baseUrl}/book/${book.slug}`,
    lastModified: new Date(book.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const categoryPages = (categories || []).map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...bookPages, ...categoryPages];
}
