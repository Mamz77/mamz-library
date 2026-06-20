import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [], count: 0 });
  }

  const { data, error, count } = await supabase
    .from("books")
    .select("id, title, author, cover_url, slug, category:categories(name)", {
      count: "exact",
    })
    .eq("is_published", true)
    .or(`title.ilike.%${q}%,author.ilike.%${q}%,description.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, query: q });
}
