import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { book_id, current_page, percentage } = body;

    if (!book_id || current_page === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await supabase.from("reading_progress").upsert(
      {
        user_id: user.id,
        book_id,
        current_page,
        percentage: Math.min(percentage || 0, 100),
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book_id" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book_id");

  if (!bookId) {
    return NextResponse.json({ error: "book_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
