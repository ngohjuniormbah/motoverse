import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (req.headers.get("x-admin-pw") !== (process.env.ADMIN_PASSWORD || "motoverse"))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  await sb.from("reviews").delete().eq("id", Number(params.id));
  return NextResponse.json({ ok: true });
}
