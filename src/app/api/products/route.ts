import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { CATALOG } from "@/lib/catalog";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ products: CATALOG });
  const { data } = await sb.from("products").select("*").order("created_at", { ascending: false });
  // Static catalog (sparepart photo set) is merged in alongside the database products.
  return NextResponse.json({ products: [...CATALOG, ...(data || [])] });
}

function ok(req: NextRequest) { return req.headers.get("x-admin-pw") === (process.env.ADMIN_PASSWORD || "motoverse"); }

export async function POST(req: NextRequest) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const b = await req.json();
  const { data, error } = await sb.from("products").insert({
    name: b.name, brand: b.brand || "Motoverse", make: b.make || "Universal", category: b.category || "Engine",
    price: b.price, badge: b.badge || "New", stock: Number(b.stock) || 0, featured: !!b.featured,
    description: b.description || "", image: b.image,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
