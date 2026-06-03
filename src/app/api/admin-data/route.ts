import { NextRequest, NextResponse } from "next/server";
import { getSupabase, withCreatedAt } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-pw") !== (process.env.ADMIN_PASSWORD || "motoverse"))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const safe = async (table: string) => {
    try {
      const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: false });
      if (error) { console.error(`admin-data ${table}:`, error.message); return []; }
      return data || [];
    } catch (e) { console.error(`admin-data ${table} threw:`, e); return []; }
  };

  const [orders, messages, products, gallery, reviews] = await Promise.all([
    safe("orders"), safe("messages"), safe("products"), safe("gallery"), safe("reviews"),
  ]);

  return NextResponse.json({
    orders: withCreatedAt(orders), messages: withCreatedAt(messages),
    products, gallery, reviews,
  });
}
