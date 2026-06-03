import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ reviews: [] });
  const { data } = await sb.from("reviews").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ reviews: data || [] });
}
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-pw") !== (process.env.ADMIN_PASSWORD || "motoverse"))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const b = await req.json();
  const { data, error } = await sb.from("reviews").insert({ name: b.name, location: b.location || "", rating: Number(b.rating) || 5, text: b.text }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data });
}
