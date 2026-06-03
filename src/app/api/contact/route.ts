import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { notifyAdmin } from "@/lib/store";

export async function POST(req: NextRequest) {
  const sb = getSupabase();
  const b = await req.json();
  let id: number | null = null;
  if (sb) {
    const { data } = await sb.from("messages").insert({
      name: b.name||"", email: b.email||"", phone: b.phone||"", vehicle: b.vehicle||"", message: b.message||"",
    }).select("id").single();
    id = data?.id ?? null;
  }
  await notifyAdmin(`New inquiry ${id?`#${id}`:""} from ${b.name}`, [
    `Name: ${b.name}`, `Email: ${b.email}`, b.phone?`Phone: ${b.phone}`:"",
    b.vehicle?`Vehicle: ${b.vehicle}`:"", ``, b.message,
  ].filter(Boolean));
  return NextResponse.json({ ok: true, id });
}
