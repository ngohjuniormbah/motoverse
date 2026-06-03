import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { notifyAdmin } from "@/lib/store";

export async function POST(req: NextRequest) {
  const sb = getSupabase();
  const b = await req.json();
  let id: number | null = null;
  if (sb) {
    const { data } = await sb.from("orders").insert({
      name: b.name||"", phone: b.phone||"", email: b.email||"", state: b.state||"",
      address: b.address||"", notes: b.notes||"", product: b.product||"", price: b.price||"",
    }).select("id").single();
    id = data?.id ?? null;
  }
  await notifyAdmin(`New order ${id?`#${id}`:""} — ${b.product} (${b.price})`, [
    `Customer: ${b.name}`, `Phone: ${b.phone}`, b.email?`Email: ${b.email}`:"",
    `State: ${b.state}`, `Address: ${b.address}`, b.notes?`Notes: ${b.notes}`:"",
    `Items: ${b.product}`, `Total: ${b.price}`,
  ].filter(Boolean));
  return NextResponse.json({ ok: true, id });
}
