import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();
    const { event_type, book_id, metadata } = body;

    await supabase.from("analytics_events").insert({
      user_id: user?.id || null,
      book_id: book_id || null,
      event_type,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
